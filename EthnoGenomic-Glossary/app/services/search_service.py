from typing import List, Optional

from sqlalchemy import case, func, or_, text
from sqlalchemy.orm import Session

from app.models.term import Term


def full_text_search(db: Session, query: Optional[str], limit: int = 20) -> List[Term]:
    if not query:
        return db.query(Term).filter(Term.active.is_(True)).limit(limit).all()

    # ensure pg_trgm is available (best-effort)
    try:
        db.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
    except Exception:
        pass

    q = query.strip()
    if not q:
        return db.query(Term).filter(Term.active.is_(True)).limit(limit).all()

    lower_q = q.lower()
    term_ru_lower = func.lower(func.coalesce(Term.term_ru, ""))
    term_en_lower = func.lower(func.coalesce(Term.term_en, ""))
    abbreviation_lower = func.lower(func.coalesce(Term.abbreviation, ""))
    vector_ru = func.to_tsvector("russian", func.concat_ws(" ", Term.term_ru, Term.definition, Term.context))
    vector_en = func.to_tsvector("english", func.concat_ws(" ", Term.term_en, Term.definition_en, Term.context_en))
    ts_query_ru = func.websearch_to_tsquery("russian", q)
    ts_query_en = func.websearch_to_tsquery("english", q)
    rank = func.greatest(func.ts_rank(vector_ru, ts_query_ru), func.ts_rank(vector_en, ts_query_en))
    exact_match = case(
        (term_ru_lower == lower_q, 3),
        (abbreviation_lower == lower_q, 2),
        (term_en_lower == lower_q, 2),
        else_=0,
    )
    prefix_like = f"{lower_q}%"
    prefix_match = case(
        (term_ru_lower.like(prefix_like), 1),
        (term_en_lower.like(prefix_like), 1),
        (abbreviation_lower.like(prefix_like), 1),
        else_=0,
    )
    rank_order = func.coalesce(rank, 0)

    fulltext = (
        db.query(Term)
        .filter(or_(vector_ru.op("@@")(ts_query_ru), vector_en.op("@@")(ts_query_en)), Term.active.is_(True))
        # Promote exact and prefix matches before falling back to text rank
        .order_by(exact_match.desc(), prefix_match.desc(), rank_order.desc(), Term.id.asc())
        .limit(limit)
        .all()
    )
    if fulltext:
        return fulltext

    # Fuzzy fallback (trigram similarity + ilike prefix)
    like = f"%{q}%"
    sim = func.greatest(
        func.similarity(func.coalesce(Term.term_ru, ""), q),
        func.similarity(func.coalesce(Term.term_en, ""), q),
        func.similarity(func.coalesce(Term.abbreviation, ""), q),
    )
    fuzzy = (
        db.query(Term)
        .filter(
            Term.active.is_(True),
            or_(
                Term.term_ru.ilike(like),
                Term.term_en.ilike(like),
                Term.abbreviation.ilike(like),
                sim > 0.05,
            ),
        )
        .order_by(exact_match.desc(), prefix_match.desc(), sim.desc(), Term.id.asc())
        .limit(limit)
        .all()
    )
    return fuzzy


def suggest_correction(db: Session, query: Optional[str], suggest_threshold: float = 0.35):
    if not query:
        return None, None

    try:
        db.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
    except Exception:
        pass

    q = query.strip()
    if len(q) < 3:
        return None, None

    sim_ru = func.similarity(func.coalesce(Term.term_ru, ""), q)
    sim_en = func.similarity(func.coalesce(Term.term_en, ""), q)
    sim_abbr = func.similarity(func.coalesce(Term.abbreviation, ""), q)
    score = func.greatest(sim_ru, sim_en, sim_abbr)

    best_text = case(
        ( (sim_ru >= sim_en) & (sim_ru >= sim_abbr), Term.term_ru ),
        ( (sim_en >= sim_ru) & (sim_en >= sim_abbr), Term.term_en ),
        else_=Term.abbreviation,
    )

    lower_q = q.lower()
    candidate = (
        db.query(best_text.label("suggestion"), score.label("score"))
        .filter(
            Term.active.is_(True),
            score.isnot(None),
            score > suggest_threshold,
            or_(
                func.lower(Term.term_ru) != lower_q,
                func.lower(Term.term_en) != lower_q,
                func.lower(Term.abbreviation) != lower_q,
            ),
        )
        .order_by(score.desc())
        .limit(1)
        .first()
    )
    if candidate:
        return candidate.suggestion, float(candidate.score)
    return None, None


def search_with_correction(db: Session, query: Optional[str], limit: int = 20):
    """
    Returns (results, corrected_query, used_correction)
    """
    results = full_text_search(db, query, limit)

    corrected_query = None
    used_correction = False

    corrected, score = suggest_correction(db, query)
    normalized = (query or "").strip().lower()
    if corrected and corrected.lower() != normalized:
        # Auto-apply correction when we otherwise have nothing and confidence is high
        if (not results) and score and score >= 0.55:
            corrected_results = full_text_search(db, corrected, limit)
            if corrected_results:
                return corrected_results, corrected, True
        # Otherwise, return suggestion alongside existing results
        corrected_query = corrected

    return results, corrected_query, used_correction

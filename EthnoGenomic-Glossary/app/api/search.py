from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, or_, text
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.models.term import Term
from app.schemas.term import SearchResponse
from app.services.search_service import search_with_correction

router = APIRouter()


@router.get("/search", response_model=SearchResponse)
def search_terms(query: Optional[str] = Query(default=None), db: Session = Depends(get_db)):
    results, corrected_query, used_correction = search_with_correction(db, query)
    return SearchResponse(results=results, corrected_query=corrected_query, used_correction=used_correction)


@router.get("/suggestions", response_model=List[str])
def get_suggestions(q: Optional[str] = Query(default=None), limit: int = 10, db: Session = Depends(get_db)):
    base = db.query(Term).filter(Term.active.is_(True))
    names: List[str] = []

    if q:
        query_text = q.strip()
        if query_text:
            try:
                db.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
            except Exception:
                pass

            lower_q = query_text.lower()
            like = f"%{lower_q}%"
            sim_ru = func.similarity(func.coalesce(func.lower(Term.term_ru), ""), lower_q)
            sim_en = func.similarity(func.coalesce(func.lower(Term.term_en), ""), lower_q)
            sim_abbr = func.similarity(func.coalesce(func.lower(Term.abbreviation), ""), lower_q)
            score = func.greatest(sim_ru, sim_en, sim_abbr)
            best_text = case(
                ((sim_ru >= sim_en) & (sim_ru >= sim_abbr), Term.term_ru),
                ((sim_en >= sim_ru) & (sim_en >= sim_abbr), Term.term_en),
                else_=Term.abbreviation,
            )

            candidates = (
                db.query(best_text.label("text"), score.label("score"))
                .filter(
                    Term.active.is_(True),
                    or_(
                        Term.term_ru.ilike(like),
                        Term.term_en.ilike(like),
                        Term.abbreviation.ilike(like),
                        score > 0.05,
                    ),
                )
                .order_by(score.desc(), Term.id.asc())
                .limit(limit * 2)
                .all()
            )
            names = [c.text.strip() for c in candidates if c.text]
    if not names:
        terms = base.limit(limit).all()
        for term in terms:
            if term.term_ru:
                names.append(term.term_ru.strip())
            if term.term_en:
                names.append(term.term_en.strip())
            if term.abbreviation:
                names.append(term.abbreviation.strip())

    # unique while preserving order
    seen = set()
    ordered = []
    for n in names:
        lowered = n.lower()
        if lowered not in seen and len(n) > 1:
            seen.add(lowered)
            ordered.append(n)
    return ordered[:limit]

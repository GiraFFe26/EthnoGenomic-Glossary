from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.term import Term
from app.schemas.term import TermCreate


def search_terms(db: Session, query: Optional[str] = None, limit: int = 20) -> List[Term]:
    if not query:
        return db.query(Term).filter(Term.active.is_(True)).limit(limit).all()

    ilike_query = f"%{query}%"
    return (
        db.query(Term)
        .filter(
            or_(
                Term.term_ru.ilike(ilike_query),
                Term.term_en.ilike(ilike_query),
                Term.abbreviation.ilike(ilike_query),
            ),
            Term.active.is_(True),
        )
        .limit(limit)
        .all()
    )


def get_term(db: Session, term_id: int) -> Optional[Term]:
    return db.query(Term).filter(Term.id == term_id).first()


def create_term(db: Session, term: TermCreate) -> Term:
    db_term = Term(**term.dict())
    db.add(db_term)
    db.commit()
    db.refresh(db_term)
    return db_term

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.db import get_db
from app.db.redis import get_redis
from app.dependencies import require_editor
from app.models.relation import Relation
from app.models.term import Term
from app.schemas.relation import RelationCreate, RelationOut
from app.schemas.term import SearchResponse, TermCreate, TermOut
from app.services import search_service, term_service
from app.services import cache_service

router = APIRouter()


@router.get("/terms", response_model=SearchResponse)
def list_terms(
    query: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    redis = Depends(get_redis),
):
    if query:
        cache_service.bump_query(redis, query)
    results, corrected_query, used_correction = search_service.search_with_correction(db, query)
    if corrected_query and used_correction:
        cache_service.bump_query(redis, corrected_query)
    if not results:
        results = term_service.search_terms(db, query)
    return SearchResponse(results=results, corrected_query=corrected_query, used_correction=used_correction)


@router.get("/terms/{term_id}", response_model=TermOut)
def get_term(term_id: int, db: Session = Depends(get_db)):
    term = term_service.get_term(db, term_id)
    if not term:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Term not found")
    return term


@router.get("/terms/{term_id}/related", response_model=List[RelationOut])
def get_related_terms(term_id: int, db: Session = Depends(get_db)):
    relations = (
        db.query(Relation)
        .filter(Relation.term_id == term_id)
        .join(Term, Term.id == Relation.related_id)
        .all()
    )
    return relations


@router.get("/alphabet/{letter}", response_model=List[TermOut])
def alphabet_index(letter: str, db: Session = Depends(get_db), redis = Depends(get_redis)):
    if len(letter) != 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provide a single letter")

    # не засоряем подсказки одиночными буквами
    pattern = f"{letter.lower()}%"
    terms = (
        db.query(Term)
        .filter(
            ((Term.term_ru.ilike(pattern)) | (Term.term_en.ilike(pattern)))
            & (Term.active.is_(True))
        )
        .order_by(Term.term_ru.asc().nulls_last())
        .all()
    )
    return terms


@router.post("/admin/term", response_model=TermOut, status_code=status.HTTP_201_CREATED)
def create_term(term: TermCreate, db: Session = Depends(get_db), _: str = Depends(require_editor)):
    return term_service.create_term(db, term)


@router.post("/admin/relation", response_model=RelationOut, status_code=status.HTTP_201_CREATED)
def create_relation(relation: RelationCreate, db: Session = Depends(get_db), _: str = Depends(require_editor)):
    relation_obj = Relation(**relation.dict())
    db.add(relation_obj)
    db.commit()
    db.refresh(relation_obj)
    return relation_obj

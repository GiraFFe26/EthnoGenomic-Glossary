from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.relation import RelationOut


class TermBase(BaseModel):
    term_ru: Optional[str] = None
    term_en: Optional[str] = None
    definition: Optional[str] = None
    context: Optional[str] = None
    definition_en: Optional[str] = None
    context_en: Optional[str] = None
    abbreviation: Optional[str] = None
    active: bool = True


class TermCreate(TermBase):
    pass


class TermUpdate(BaseModel):
    term_ru: Optional[str] = None
    term_en: Optional[str] = None
    definition: Optional[str] = None
    context: Optional[str] = None
    definition_en: Optional[str] = None
    context_en: Optional[str] = None
    abbreviation: Optional[str] = None
    active: Optional[bool] = None


class TermOut(TermBase):
    id: int
    relations: List[RelationOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    results: List[TermOut] = Field(default_factory=list)
    corrected_query: Optional[str] = None
    used_correction: bool = False

from typing import Optional

from pydantic import BaseModel


class RelationBase(BaseModel):
    term_id: int
    related_id: int
    type: Optional[str] = None


class RelationCreate(RelationBase):
    pass


class RelationOut(RelationBase):
    id: int

    model_config = {"from_attributes": True}

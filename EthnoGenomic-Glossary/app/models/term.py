from sqlalchemy import Column, Integer, Text, Boolean

from app.db.db import Base


class Term(Base):
    __tablename__ = "terms"

    id = Column(Integer, primary_key=True, index=True)
    term_ru = Column(Text, nullable=True, index=True)
    term_en = Column(Text, nullable=True, index=True)
    definition = Column(Text, nullable=True)
    context = Column(Text, nullable=True)
    definition_en = Column(Text, nullable=True)
    context_en = Column(Text, nullable=True)
    abbreviation = Column(Text, nullable=True, index=True)
    active = Column(Boolean, nullable=False, default=True)

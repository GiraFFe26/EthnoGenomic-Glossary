from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.db import Base


class Relation(Base):
    __tablename__ = "relations"

    id = Column(Integer, primary_key=True, index=True)
    term_id = Column(Integer, ForeignKey("terms.id", ondelete="CASCADE"), nullable=False)
    related_id = Column(Integer, ForeignKey("terms.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(20), nullable=True)

    term = relationship("Term", foreign_keys=[term_id], backref="relations")
    related = relationship("Term", foreign_keys=[related_id])

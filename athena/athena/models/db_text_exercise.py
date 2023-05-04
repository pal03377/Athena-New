from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from athena.database import Base
from . import DBExercise


class DBTextExercise(DBExercise, Base):
    __tablename__ = "text_exercises"

    example_solution = Column(String)

    submissions = relationship("DBTextSubmission", back_populates="exercise")
    feedbacks = relationship("DBTextFeedback", back_populates="exercise")

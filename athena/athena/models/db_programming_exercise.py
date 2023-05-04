from sqlalchemy import Column, String
from sqlalchemy.orm import relationship

from . import DBExercise, DBFeedback, DBSubmission
from athena.schemas import ExerciseType
from athena.database import Base


class DBProgrammingExercise(DBExercise, Base):
    __tablename__ = "programming_exercises"

    programming_language = Column(String)
    solution_repository_url = Column(String)
    template_repository_url = Column(String)
    tests_repository_url = Column(String)

    submissions = relationship("DBProgrammingSubmission", back_populates="exercise")
    feedbacks = relationship("DBProgrammingFeedback", back_populates="exercise")

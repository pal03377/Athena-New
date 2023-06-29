from sqlalchemy import Column, Integer, String, Float, JSON, Enum as SqlEnum

from athena.schemas import ExerciseType
from .model import Model


class DBExercise(Model):
    id = Column(Integer, primary_key=True, index=True, nullable=False)
    title = Column(String, index=True, nullable=False)
    type = Column(SqlEnum(ExerciseType), index=True, nullable=False)
    max_points = Column(Float, index=True, nullable=False)
    bonus_points = Column(Float, index=True, nullable=False)
    grading_instructions = Column(String, nullable=False)
    problem_statement = Column(String, nullable=False)
    meta = Column(JSON, nullable=False)

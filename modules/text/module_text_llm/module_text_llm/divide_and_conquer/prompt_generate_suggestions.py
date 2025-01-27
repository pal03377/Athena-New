from pydantic import Field, BaseModel
from typing import List, Optional
# Prompts are generated at run time.
# Output Object
# Names have been redefined here, to be consistent with the prompt
# Local LLMs do better with these names. GoatPT does not care and does everything!
class FeedbackModel(BaseModel):
    """ A Feedback object consisting of the criteria title, the feedback text, a line_start and line_end to depict
    a reference to the text, creidts to depcit the credit amount given and an assessment_instruction_id to depict the assessment instruction ID used"""
    criteria: str = Field(description="Short Criteria title!")
    feedback: str = Field(description="The feedback in text form.")
    line_start: Optional[int] = Field(description="Referenced line number start, or empty if unreferenced")
    line_end: Optional[int] = Field(description="Referenced line number end, or empty if unreferenced")
    credits: float = Field(0.0, description="Number of credits received/deducted")
    assessment_instruction_id: Optional[int] = Field(
        description="ID of the assessment instruction that was used to generate this feedback, or empty if no assessment instruction was used"
    )

class AssessmentModel(BaseModel):
    """Collection of feedbacks making up an assessment"""
    assessment: List[FeedbackModel] = Field(description="Assessment feedbacks")
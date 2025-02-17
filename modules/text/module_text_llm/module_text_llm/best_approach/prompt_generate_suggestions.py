from pydantic import Field, BaseModel
from typing import List, Optional

system_message = """You are an AI tutor for text assessment at a prestigious university.

# Task
Create graded feedback suggestions for a student's text submission that a human tutor would accept. Meaning, the feedback you provide should be applicable to the submission with little to no modification.

# Style
1. Constructive, 2. Specific, 3. Balanced, 4. Clear and Concise, 5. Actionable, 6. Educational, 7. Contextual

# Problem statement
{problem_statement}

# Example solution
{example_solution}

# Grading instructions
{grading_instructions}
Max points: {max_points}, bonus points: {bonus_points}
    
Respond in json.
"""

human_message = """Student's submission to grade (with sentence numbers <number>: <sentence>):

{submission}
"""

# Input Prompt
class GenerateSuggestionsPrompt(BaseModel):
    """Features available: **{problem_statement}**, **{example_solution}**, **{grading_instructions}**, **{max_points}**, **{bonus_points}**, **{submission}**

_Note: **{problem_statement}**, **{example_solution}**, or **{grading_instructions}** might be omitted if the input is too long._"""
    system_message: str = Field(default=system_message,
                                description="Message for priming AI behavior and instructing it what to do.")
    human_message: str = Field(default=human_message,
                               description="Message from a human. The input on which the AI is supposed to act.")

# Output Object
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
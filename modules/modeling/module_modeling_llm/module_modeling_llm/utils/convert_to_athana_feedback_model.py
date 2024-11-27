from typing import List, Optional
from athena.modeling import Feedback
from athena.schemas.grading_criterion import GradingCriterion
from module_modeling_llm.models.assessment_model import AssessmentModel
from module_modeling_llm.models.exercise_model import ExerciseModel


def convert_to_athana_feedback_model(
        feedback_result: AssessmentModel,
        exercise_model: ExerciseModel,
        manual_structured_grading_instructions: Optional[List[GradingCriterion]] = None
    ) -> List[Feedback]:

    grading_instruction_ids = {
        grading_instruction.id
        for criterion in (manual_structured_grading_instructions or [])
        for grading_instruction in criterion.structured_grading_instructions
    }

    feedbacks = []
    for feedback in feedback_result.feedbacks:
        grading_instruction_id = (
            feedback.grading_instruction_id
            if feedback.grading_instruction_id in grading_instruction_ids
            else None
        )

        reference: Optional[str] = None
        if feedback.element_name:
            reference_id = exercise_model.element_id_mapping.get(feedback.element_name)
            reference_type = exercise_model.id_type_mapping.get(reference_id) if reference_id else None

            if reference_type and reference_id:
                reference = f"{reference_type}:{reference_id}"

        feedbacks.append(Feedback(
            exercise_id=exercise_model.exercise_id,
            submission_id=exercise_model.submission_id,
            title=feedback.title,
            description=feedback.description,
            credits=feedback.credits,
            structured_grading_instruction_id=grading_instruction_id,
            meta={},
            id=None,
            is_graded=False,
            reference=reference,
            element_ids=[reference_id] if reference_id else []
        ))

    return feedbacks
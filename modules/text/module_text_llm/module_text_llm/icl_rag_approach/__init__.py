from module_text_llm.approach_config import ApproachConfig
from pydantic import Field
from typing import Literal
from athena.text import Exercise, Submission
from module_text_llm.icl_rag_approach.generate_suggestions import generate_suggestions
from module_text_llm.icl_rag_approach.prompt_generate_suggestions import GenerateSuggestionsPrompt

class IclRagApproachConfig(ApproachConfig):
    type: Literal['icl_rag_approach'] = 'icl_rag_approach'
    generate_suggestions_prompt: GenerateSuggestionsPrompt = Field(default=GenerateSuggestionsPrompt())
    
    async def generate_suggestions(self, exercise: Exercise, submission: Submission, config, debug: bool):
        return await generate_suggestions(exercise, submission, config, debug)
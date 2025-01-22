from pydantic import BaseModel, Field
from typing import Union
from athena import config_schema_provider

from module_text_llm.chain_of_thought_approach import ChainOfThoughtConfig
from module_text_llm.basic_approach import BasicApproachConfig
from module_text_llm.ollama_chain_of_thought_approach import OllamaChainOfThoughtConfig
from module_text_llm.few_shot_chain_of_thought_approach import FewShotChainOfThoughtConfig
from module_text_llm.basic_COT import BasicCOTApproachConfig



ApproachConfigUnion = Union[BasicApproachConfig, FewShotChainOfThoughtConfig,BasicCOTApproachConfig ]

@config_schema_provider
class Configuration(BaseModel):
    debug: bool = Field(default=False, description="Enable debug mode.")
    approach: ApproachConfigUnion = Field(default_factory=BasicApproachConfig)  # Default to BasicApproach

    class Config:
        smart_union = True 

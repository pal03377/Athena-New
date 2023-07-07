# mypy: ignore-errors
import os
from contextlib import contextmanager
from typing import Any, Callable, List, Literal
from pydantic import BaseModel, Field, validator, PositiveInt
from enum import Enum

import openai
from langchain.chat_models import AzureChatOpenAI, ChatOpenAI
from langchain.llms import AzureOpenAI, OpenAI
from langchain.llms.openai import BaseOpenAI
from langchain.base_language import BaseLanguageModel

from athena.logger import logger


OPENAI_PREFIX = "openai_"
AZURE_OPENAI_PREFIX = "azure_openai_"


#########################################################################
# Monkey patching openai/langchain api                                  #
# ===================================================================== #
# This allows us to have multiple api keys i.e. mixing                  #
# openai and azure openai api keys so we can use not only deployed      #
# models but also models from the non-azure openai api.                 #
# This is mostly for testing purposes, in production we can just deploy #
# the models to azure that we want to use.                              #
#########################################################################

def _wrap(old: Any, new: Any) -> Callable:
    def repl(*args: Any, **kwargs: Any) -> Any:
        new(args[0])  # args[0] is self
        return old(*args, **kwargs)
    return repl


def _async_wrap(old: Any, new: Any):
    async def repl(*args, **kwargs):
        new(args[0])  # args[0] is self
        return await old(*args, **kwargs)
    return repl


def _set_credentials(self):
    openai.api_key = self.openai_api_key

    api_type = "open_ai"
    api_base = "https://api.openai.com/v1"
    api_version = None
    if hasattr(self, "openai_api_type"):
        api_type = self.openai_api_type

    if api_type == "azure":
        if hasattr(self, "openai_api_base"):
            api_base = self.openai_api_base
        if hasattr(self, "openai_api_version"):
            api_version = self.openai_api_version

    openai.api_type = api_type
    openai.api_base = api_base
    openai.api_version = api_version


# Monkey patching langchain
ChatOpenAI._generate = _wrap(ChatOpenAI._generate, _set_credentials)  # pylint: disable=protected-access # type: ignore
ChatOpenAI._agenerate = _async_wrap(ChatOpenAI._agenerate, _set_credentials)  # pylint: disable=protected-access # type: ignore
BaseOpenAI._agenerate = _wrap(BaseOpenAI._agenerate, _set_credentials)  # pylint: disable=protected-access # type: ignore
BaseOpenAI._agenerate = _async_wrap(BaseOpenAI._agenerate, _set_credentials)  # pylint: disable=protected-access # type: ignore

#########################################################################
# Monkey patching end                                                   #
#########################################################################


def _use_azure_credentials():
    openai.api_type = "azure"
    openai.api_key = os.environ.get("LLM_AZURE_OPENAI_API_KEY")
    openai.api_base = os.environ.get("LLM_AZURE_OPENAI_API_BASE")
    # os.environ.get("LLM_AZURE_OPENAI_API_VERSION")
    openai.api_version = "2022-06-01-preview"


def _use_openai_credentials():
    openai.api_type = "open_ai"
    openai.api_key = os.environ.get("LLM_OPENAI_API_KEY")
    openai.api_base = "https://api.openai.com/v1"
    openai.api_version = None


openai_available = os.environ.get("LLM_OPENAI_API_KEY") is not None
azure_openai_available = os.environ.get("LLM_AZURE_OPENAI_API_KEY") is not None


# This is a hack to make sure that the openai api is set correctly
# Right now it is overkill, but it will be useful when the api gets fixed and we no longer
# hardcode the model names
@contextmanager
def _openai_client(use_azure_api: bool, is_preference: bool):
    """Set the openai client to use the correct api type, if available

    Args:
        use_azure_api (bool): If true, use the azure api, else use the openai api
        is_preference (bool): If true, it can fall back to the other api if the preferred one is not available
    """
    if use_azure_api:
        if azure_openai_available:
            _use_azure_credentials()
        elif is_preference and openai_available:
            _use_openai_credentials()
        elif is_preference:
            raise EnvironmentError(
                "No OpenAI api available, please set LLM_AZURE_OPENAI_API_KEY, LLM_AZURE_OPENAI_API_BASE and LLM_AZURE_OPENAI_API_VERSION environment variables or LLM_OPENAI_API_KEY environment variable")
        else:
            raise EnvironmentError(
                "Azure OpenAI api not available, please set LLM_AZURE_OPENAI_API_KEY, LLM_AZURE_OPENAI_API_BASE and LLM_AZURE_OPENAI_API_VERSION environment variables")
    else:
        if openai_available:
            _use_openai_credentials()
        elif is_preference and azure_openai_available:
            _use_azure_credentials()
        elif is_preference:
            raise EnvironmentError(
                "No OpenAI api available, please set LLM_OPENAI_API_KEY environment variable or LLM_AZURE_OPENAI_API_KEY, LLM_AZURE_OPENAI_API_BASE and LLM_AZURE_OPENAI_API_VERSION environment variables")
        else:
            raise EnvironmentError(
                "OpenAI api not available, please set LLM_OPENAI_API_KEY environment variable")

    yield


def _get_available_deployments(openai_models: dict[str, List[str]], model_aliases: dict[str, str]):
    available_deployments: dict[str, dict[str, Any]] = {
        "chat_completion": {},
        "completion": {},
        "fine_tuneing": {},
    }

    if azure_openai_available:
        with _openai_client(use_azure_api=True, is_preference=False):
            deployments = openai.Deployment.list().get("data")  # type: ignore
            if deployments is not None:
                for deployment in deployments:
                    model_name = deployment.model
                    if model_name in model_aliases:
                        model_name = model_aliases[model_name]
                    if model_name in openai_models["chat_completion"]:
                        available_deployments["chat_completion"][deployment.id] = deployment
                    elif model_name in openai_models["completion"]:
                        available_deployments["completion"][deployment.id] = deployment
                    elif model_name in openai_models["fine_tuneing"]:
                        available_deployments["fine_tuneing"][deployment.id] = deployment

    return available_deployments


def _get_available_models(openai_models, available_deployments):
    available_models: dict[str, BaseLanguageModel] = {}

    if openai_available:
        openai_api_key = os.environ["LLM_OPENAI_API_KEY"]
        for model_name in openai_models["chat_completion"]:
            available_models[f"{OPENAI_PREFIX}{model_name}"] = ChatOpenAI(
                model=model_name, openai_api_key=openai_api_key, client="")
        for model_name in openai_models["completion"]:
            available_models[f"{OPENAI_PREFIX}{model_name}"] = OpenAI(
                model=model_name, openai_api_key=openai_api_key, client="")

    if azure_openai_available:
        azure_openai_api_key = os.environ["LLM_AZURE_OPENAI_API_KEY"]
        azure_openai_api_base = os.environ["LLM_AZURE_OPENAI_API_BASE"]
        azure_openai_api_version = os.environ["LLM_AZURE_OPENAI_API_VERSION"]

        for deployment_name, deployment in available_deployments["chat_completion"].items():
            available_models[f"{AZURE_OPENAI_PREFIX}{deployment_name}"] = AzureChatOpenAI(
                deployment_name=deployment_name,
                openai_api_base=azure_openai_api_base,
                openai_api_version=azure_openai_api_version,
                openai_api_key=azure_openai_api_key,
                client="",
            )

        for deployment_name, deployment in available_deployments["completion"].items():
            available_models[f"{AZURE_OPENAI_PREFIX}{deployment_name}"] = AzureOpenAI(
                model=deployment.model,
                deployment_name=deployment_name,
                openai_api_base=azure_openai_api_base,
                openai_api_version=azure_openai_api_version,
                openai_api_key=azure_openai_api_key,
                client="",
            )

    return available_models


_model_aliases = {
    "gpt-35-turbo": "gpt-3.5-turbo",
}

# Hardcoded because openai can't provide a trustworthly api to get the list of models and capabilities...
openai_models = {
    "chat_completion": [
        "gpt-4",
        "gpt-4-32k",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-16k"
    ],
    "completion": [
        "text-davinci-003",
        "text-curie-001",
        "text-babbage-001",
        "text-ada-001",
    ],
    "fine_tuneing": [
        "davinci",
        "curie",
        "babbage",
        "ada",
    ]
}
available_deployments = _get_available_deployments(
    openai_models, _model_aliases)
available_models = _get_available_models(openai_models, available_deployments)


OpenAIModel = Enum('OpenAIModel', {
                   name: name for name in available_models})


# Long descriptions will be displayed in the playground UI and are copied from the OpenAI docs
class OpenAIModelSettings(BaseModel):
    model_name: OpenAIModel = Field(...,  # type: ignore
                                    description="The name of the model to use.")
    max_tokens: PositiveInt = Field(..., description="""\
The maximum number of [tokens](https://platform.openai.com/tokenizer) to generate in the chat completion.

The total length of input tokens and generated tokens is limited by the model's context length. \
[Example Python code](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb) for counting tokens.\
""")

    temperature: float = Field(0.7, ge=0, le=2, description="""\
What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, \
while lower values like 0.2 will make it more focused and deterministic.

We generally recommend altering this or `top_p` but not both.\
""")

    top_p: float = Field(1, ge=0, le=1, description="""\
An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. \
So 0.1 means only the tokens comprising the top 10% probability mass are considered.

We generally recommend altering this or `temperature` but not both.\
""")

    presence_penalty: float = Field(
        0, ge=-2, le=2, description="""\
Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, \
increasing the model's likelihood to talk about new topics.

[See more information about frequency and presence penalties.](https://platform.openai.com/docs/api-reference/parameter-details)\
""")

    frequency_penalty: float = Field(
        0, ge=-2, le=2, description="""\
Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, \
decreasing the model's likelihood to repeat the same line verbatim.

[See more information about frequency and presence penalties.](https://platform.openai.com/docs/api-reference/parameter-details)\
""")

    @validator('max_tokens')
    def max_tokens_must_be_positive(cls, v):
        """
        Validate that max_tokens is a positive integer.
        """
        max_contextsize = BaseOpenAI(model=cls.model_name.value, client="").modelname_to_contextsize(
            modelname=cls.model_name.value)

        if v <= 0:
            raise ValueError('max_tokens must be a positive integer')
        if v > max_contextsize:
            raise ValueError(
                f'max_tokens must be less than or equal to {max_contextsize} for model {cls.model_name}')
        return v


logger.info("Available openai models: %s", ", ".join(available_models.keys()))

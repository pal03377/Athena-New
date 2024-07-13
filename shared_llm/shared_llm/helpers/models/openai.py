import os
from contextlib import contextmanager
from typing import Any, Callable, Dict, List
from pydantic import Field, validator, PositiveInt
from enum import Enum
import openai
from langchain.base_language import BaseLanguageModel
from langchain_openai import AzureChatOpenAI, AzureOpenAI, ChatOpenAI

from athena.logger import logger
from .model_config import ModelConfig


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

# Prevent LangChain error, we will set the key later
os.environ["OPENAI_API_KEY"] = ""

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
    openai.api_base = api_base #type:ignore
    openai.api_version = api_version


# Monkey patching langchain
# pylint: disable=protected-access
ChatOpenAI._generate = _wrap(ChatOpenAI._generate, _set_credentials)  # type: ignore
ChatOpenAI._agenerate = _async_wrap(ChatOpenAI._agenerate, _set_credentials)  # type: ignore
# BaseOpenAI._generate = _wrap(BaseOpenAI._generate, _set_credentials)  # type: ignore
# BaseOpenAI._agenerate = _async_wrap(BaseOpenAI._agenerate, _set_credentials)  # type: ignore
# pylint: enable=protected-access

#########################################################################
# Monkey patching end                                                   #
#########################################################################


def _use_azure_credentials():
    openai.api_type = "azure"
    openai.api_key = os.environ.get("LLM_AZURE_OPENAI_API_KEY")
    openai.api_base = os.environ.get("LLM_AZURE_OPENAI_API_BASE")#type:ignore
    # os.environ.get("LLM_AZURE_OPENAI_API_VERSION")
    openai.api_version = "2023-03-15-preview"


def _use_openai_credentials():
    openai.api_type = "open_ai"
    openai.api_key = os.environ.get("LLM_OPENAI_API_KEY")
    openai.api_base = "https://api.openai.com/v1"#type:ignore
    openai.api_version = None


openai_available = bool(os.environ.get("LLM_OPENAI_API_KEY"))
azure_openai_available = bool(os.environ.get("LLM_AZURE_OPENAI_API_KEY"))


# This is a hack to make sure that the openai api is set correctly
# Right now it is overkill, but it will be useful when the api gets fixed and we no longer
# hardcode the model names (i.e. OpenAI fixes their api)
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
                "No OpenAI api available, please set LLM_AZURE_OPENAI_API_KEY, LLM_AZURE_OPENAI_API_BASE and "
                "LLM_AZURE_OPENAI_API_VERSION environment variables or LLM_OPENAI_API_KEY environment variable"
            )
        else:
            print("nothing here but dont about")
            # raise EnvironmentError(
            #     "Azure OpenAI api not available, please set LLM_AZURE_OPENAI_API_KEY, LLM_AZURE_OPENAI_API_BASE and "
            #     "LLM_AZURE_OPENAI_API_VERSION environment variables"
            # )
    else:
        if openai_available:
            _use_openai_credentials()
        elif is_preference and azure_openai_available:
            _use_azure_credentials()
        elif is_preference:
            raise EnvironmentError(
                "No OpenAI api available, please set LLM_OPENAI_API_KEY environment variable or LLM_AZURE_OPENAI_API_KEY, "
                "LLM_AZURE_OPENAI_API_BASE and LLM_AZURE_OPENAI_API_VERSION environment variables"
            )
        else:
            raise EnvironmentError(
                "OpenAI api not available, please set LLM_OPENAI_API_KEY environment variable"
            )

    # API client is setup correctly
    yield

def _get_available_deployments():
    available_deployments: Dict[str, Dict[str, Any]] = {
        "chat_completion": {},
        "completion": {},
        "fine_tune": {},
        "embeddings": {},
        "inference": {}
    }

    with _openai_client(use_azure_api=True, is_preference=False):
        if azure_openai_available:
            deployments = openai.AzureOpenAI(api_version=openai.api_version, azure_endpoint=openai.api_base, api_key=openai.api_key).models.list() or []#type:ignore
            for deployment in deployments:
                if deployment.capabilities["chat_completion"]:#type:ignore
                    available_deployments["chat_completion"][deployment.id] = deployment
        if openai_available:
            models = openai.Model.list()#type:ignore
            # for model in models:
            #     pass

    return available_deployments


def _get_available_models(available_deployments: Dict[str, Dict[str, Any]]):
    available_models: Dict[str, BaseLanguageModel] = {}

    if openai_available:
        openai_api_key = os.environ["LLM_OPENAI_API_KEY"]
        for model in available_models["chat_completion"]:
            available_models[OPENAI_PREFIX + model.id] = ChatOpenAI(#type:ignore
                model=model.id,#type:ignore
                openai_api_key=openai_api_key,#type:ignore
                client="",
                temperature=0
            )
        for model in available_models["completion"]:
            available_models[OPENAI_PREFIX + model.id] = OpenAI(#type:ignore
                model=model.id,#type:ignore
                openai_api_key=openai_api_key,
                client="",
                temperature=0
            )

    if azure_openai_available:
        azure_openai_api_key = os.environ["LLM_AZURE_OPENAI_API_KEY"]
        azure_openai_api_base = os.environ["LLM_AZURE_OPENAI_API_BASE"]
        azure_openai_api_version = os.environ["LLM_AZURE_OPENAI_API_VERSION"]

        for model_type, Model in [("chat_completion", AzureChatOpenAI), ("completion", AzureOpenAI)]:
            for deployment_name, deployment in available_deployments[model_type].items():
                available_models[AZURE_OPENAI_PREFIX + deployment_name] = Model(
                    deployment_name=deployment_name,
                    azure_endpoint=azure_openai_api_base,
                    openai_api_version=azure_openai_api_version,
                    openai_api_key=azure_openai_api_key,
                    client="",
                    temperature=0
                )

    return available_models


available_deployments = _get_available_deployments()
available_models = _get_available_models(available_deployments)
if available_models:
    logger.info("Available openai models: %s", ", ".join(available_models.keys()))

    OpenAIModel = Enum('OpenAIModel', {name: name for name in available_models})  # type: ignore
    default_model_name = "gpt-35-turbo"
    if "LLM_DEFAULT_MODEL" in os.environ and os.environ["LLM_DEFAULT_MODEL"] in available_models:
        default_model_name = os.environ["LLM_DEFAULT_MODEL"]
    if default_model_name not in available_models:
        default_model_name = list(available_models.keys())[0]

    default_openai_model = OpenAIModel[default_model_name]#type:ignore

    # Long descriptions will be displayed in the playground UI and are copied from the OpenAI docs
    class OpenAIModelConfig(ModelConfig):
        """OpenAI LLM configuration."""

        model_name: OpenAIModel = Field(default=default_openai_model,  # type: ignore
                                        description="The name of the model to use.")
        max_tokens: PositiveInt = Field(1000, description="""\
The maximum number of [tokens](https://platform.openai.com/tokenizer) to generate in the chat completion.

The total length of input tokens and generated tokens is limited by the model's context length. \
[Example Python code](https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb) for counting tokens.\
""")

        temperature: float = Field(default=0.0, ge=0, le=2, description="""\
What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, \
while lower values like 0.2 will make it more focused and deterministic.

We generally recommend altering this or `top_p` but not both.\
""")

        top_p: float = Field(default=1, ge=0, le=1, description="""\
An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. \
So 0.1 means only the tokens comprising the top 10% probability mass are considered.

We generally recommend altering this or `temperature` but not both.\
""")

        presence_penalty: float = Field(default=0, ge=-2, le=2, description="""\
Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, \
increasing the model's likelihood to talk about new topics.

[See more information about frequency and presence penalties.](https://platform.openai.com/docs/api-reference/parameter-details)\
""")

        frequency_penalty: float = Field(default=0, ge=-2, le=2, description="""\
Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, \
decreasing the model's likelihood to repeat the same line verbatim.

[See more information about frequency and presence penalties.](https://platform.openai.com/docs/api-reference/parameter-details)\
""")

        @validator('max_tokens')
        def max_tokens_must_be_positive(cls, v):
            """
            Validate that max_tokens is a positive integer.
            """
            if v <= 0:
                raise ValueError('max_tokens must be a positive integer')
            return v

        def get_model(self) -> BaseLanguageModel:
            """Get the model from the configuration.

            Returns:
                BaseLanguageModel: The model.
            """
            model = available_models[self.model_name.value]
            kwargs = model.__dict__ #BaseLanguageModel type
            # kw = model._lc_kwargs
            secrets = {secret: getattr(model, secret) for secret in model.lc_secrets.keys()}
            kwargs.update(secrets)

            model_kwargs = kwargs.get("model_kwargs", {})
            for attr, value in self.dict().items():
                if attr == "model_name":
                    # Skip model_name
                    continue
                if hasattr(model, attr):
                    # If the model has the attribute, add it to kwargs
                    kwargs[attr] = value
                else:
                    # Otherwise, add it to model_kwargs (necessary for chat models)
                    model_kwargs[attr] = value
            kwargs["model_kwargs"] = model_kwargs

            # Initialize a copy of the model using the config
            model = model.__class__(**kwargs)
            return model


        class Config:
            title = 'OpenAI'
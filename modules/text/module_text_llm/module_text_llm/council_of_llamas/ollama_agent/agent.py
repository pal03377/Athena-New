from ollama import Client
import requests
import os
import inspect
import json
from typing import List
from enum import Enum
# from llm_core.ollama_agent.prompts import system_message_initiator,system_message_summarizer, build_agent_prompt
from module_text_llm.council_of_llamas.ollama_agent.prompts import build_summarizer_prompt_human, build_initiation_prompt, build_summarizer_prompt, build_agent_prompt
from athena.logger import logger
from athena.text import Exercise, Submission
from module_text_llm.council_of_llamas.prompt_generate_suggestions import AssessmentModel, FeedbackModel

def function_to_json(func, special_name=None):
    if special_name is None:
        func_name = func.__name__   
    else:
        func_name = special_name
    
    params = inspect.signature(func).parameters
    params_info = {}
    for param_name, param in params.items():
        params_info[param_name] = {
            "type": str(param.annotation) if param.annotation != inspect.Parameter.empty else "unknown",
            "default": str(param.default) if param.default != inspect.Parameter.empty else "None"
        }

    return_type = str(inspect.signature(func).return_annotation) if inspect.signature(func).return_annotation != inspect.Signature.empty else "unknown"
    
    if func.__doc__:
        func_description = func.__doc__
    else :
        raise ValueError("Function must have a docstring")

    method_info = {
        "name": func_name,
        "description": func_description,
        "parameters": params_info,
        "return_type": {"type": return_type, "description": "Return value"}
    }
    return json.dumps(method_info, indent=2)

class Agent():
    def __init__(self, model: str):
        self.model = model
        self.messages = []
        self.host = "https://gpu-artemis.ase.cit.tum.de/ollama/"
        self.auth_headers={
            'Authorization': requests.auth._basic_auth_str(os.environ["GPU_USER"],os.environ["GPU_PASSWORD"])
        }
        self.client = Client(
            host=self.host,
            headers=self.auth_headers
        )
        
    def invoke(self, message):
        """Calls the agent with a message and returns the response

        Args:
            message (str): the message to send to the agent
        """
        self.add_user_message(message)
        response =  self.client.chat(
        model='llama3.3:latest',
        messages=self.messages,
        stream=False
    )
        content = response["message"]["content"]
        self.add_assistant_message(content)
        return content
    
    def invoke_with_json(self, message):
        """Calls the agent with a message and returns the response

        Args:
            message (str): the message to send to the agent
        """
        self.add_user_message(message)
        response =  self.client.chat(
        model='llama3.3:latest',
        messages=self.messages,
        stream=False,
        format ="json"
    )
        content = response["message"]["content"]
        self.add_assistant_message(content)
        return content
    
    def add_user_message(self, message):
        self.messages.append({'role': 'user', 'content': message})
    def add_assistant_message(self, message):
        self.messages.append({'role': 'assistant', 'content': message})
    def add_system_message(self, message):
        self.messages.append({'role': 'system', 'content': message})     
    def get_system_message(self):
        return self.messages[0]["content"]
class ToolCallingAgent(Agent):
    def __init__(self, model: str, exercise: dict):
        super().__init__(model)
        self.exercise = exercise

    def add_tool(self, tool, tool_name=None):
        """Adds a tool to the agent's list of tools."""
        if tool_name is None:
            tool_name = tool.__name__
        identified_tool = {tool_name: tool}
        self.tools.update(identified_tool)
    def bind_tools(self, tools:list, tools_with_identifier:dict = {}):
        """Binds the tools to the agent. you can also bind tools with an identifier"""
        available_tools = {}
        system_context = ""
        tools.append(self.get_exercise_detail)
        for tool in tools:   
            print("Binding tool ", tool.__name__) 
            available_tools[tool.__name__] = tool
            system_context+= "-"*50+"\n"
            system_context+=function_to_json(tool)
            system_context+= "-"*50+"\n"
    
        available_tools.update(tools_with_identifier)
        for tool_identifier, tool in tools_with_identifier.items():
            system_context += "-" * 50 + "\n"
            system_context += function_to_json(tool,tool_identifier)
            system_context += "\n" + "-" * 50 + "\n"
        self.tools = available_tools
        self.add_system_message(f"""
        You are a multi tool agent. You are responsible for calling correct functions based on the user input.
        You have the following functions available: {list(available_tools.keys())}
        These are defined as follows:
        {system_context}
    """)
    
    def get_exercise_detail(self, detail: str) -> str:
        """Gets a detail from the exercise object. The detail must be one of 
        'problem_statement', 'example_solution', 'grading_criteria', 
        'max_points', or 'title'.
        """
        # Map the detail string to the corresponding attribute of the exercise object
        if hasattr(self.exercise, detail):
            return getattr(self.exercise, detail)
        
        return "Detail does not exist."
    
    def invoke(self,message):
        self.add_user_message(message)
        response =  self.client.chat(
            model=self.model,
            messages=self.messages,
            stream=False,
            tools=[self.tools]
            )
        print(response)
        tool_calls = response["message"]["tool_calls"]
        return self.parse_call(tool_calls)
    
    def parse_call(self, calls):
        responses = []
        for tool in calls:
            function_to_call = self.tools[tool.function.name]

            # Check if arguments are nested and handle them accordingly (for example functions)
            arguments = self._parse_arguments(tool.function.arguments)
            
            resp = function_to_call(**arguments)
            
            responses.append({
                "Function called: ": tool.function.name,
                "Arguments": arguments,
                "Response": resp
            })
            
        return responses

    def _parse_arguments(self, arguments):
        """
        Parses nested arguments and ensures that they are in the correct format
        for function calls.
        """
        parsed_arguments = {}

        if isinstance(arguments, dict):
            for key, value in arguments.items():
                # Check if the value is another function call (contains 'function_name')
                if isinstance(value, dict) and 'function_name' in value:
                    parsed_arguments[key] = self._call_function_by_name(value)
                else:
                    parsed_arguments[key] = value

        return parsed_arguments

    def _call_function_by_name(self, value):
        """
        This function handles calling a function specified in 'value' and
        returns its response.
        """
        function_name = value.get('function_name')
        args = value.get('args', [])
        if function_name in self.tools:
            function_to_call = self.tools[function_name]
            return function_to_call(*args)
        else:
            raise ValueError(f"Function {function_name} not found.")      

class AgentType(Enum):
    TEXT = "TEXT"
    MODELING = "MODELING"
    PROGRAMMING = "PROGRAMMING"
    
class MultiAgentExecutor():
    def __init__(self, model, tools, exercise: Exercise, submission: str, num_agents=2, type = AgentType.TEXT):
        """Initialize the agent system for a given exercise submission with specified configuration.

        Args:
            model (Model): The model to be used for agent responses.
            tools (list): List of tools or resources available to the agents during execution.
            exercise (Exercise): The exercise that the agents are working on.
            submission (Submission): The student's submission related to the exercise.
            num_agents (int, optional): The number of agents to be used. Defaults to 2.
            type (AgentType, optional): The type of agents to be created. Defaults to AgentType.TEXT.
        """
        self.deliberation_ended = False
        self.initiator_agent = Agent(model=model)
        self.exercise = exercise
        self.initiator_agent.add_system_message(build_initiation_prompt(exercise.problem_statement, exercise.grading_criteria))
        self.agents = []
        self.feedbacks =  {}
        self.submission = submission
        for i in range (num_agents):
            agent = Agent(model=model)
            agent.add_system_message(build_agent_prompt(exercise.problem_statement, exercise.example_solution, exercise.grading_criteria, exercise.max_points, submission, i+1))

            self.agents.append(agent)
        self.information_manager = Agent(model=model)
        self.information_manager.add_system_message(build_summarizer_prompt(exercise.id,submission))
        
        self.tool_agent = ToolCallingAgent(model, exercise)
        tools.append(self.generate_suggestion)
        tools.append(self.end_deliberation)
        self.tool_agent.bind_tools(tools)
    
    def invoke_deliberation(self, rounds = 1,consensus_mechanism = "majority", threshold = 0.5, turn_selection = "round_robin"):
        """Invoke a deliberation process with multiple rounds and a consensus mechanism.

        Args:
            rounds (int, optional): Number of deliberation rounds. Defaults to 3.
            consensus_mechanism (str, optional): Consensus mechanism to use. Must be one of 
            ["majority", "unanimity", "plurality", "ranked_choice", "consensus_threshold"]. Defaults to "majority".
            "mediator": The mediator will be the one to make the final decision at the end of the deliberation rounds.
            "majority": After deliberation rounds are finished the majority vote will be the final decision.
        Raises:
            ValueError: If the consensus mechanism is not one of the acceptable options.
        """
        if rounds < 2:
            raise ValueError("The number of rounds must be at least 2")
            
        acceptable_mechanisms = ["majority", "unanimity", "plurality", "ranked_choice", "consensus_threshold"]
        if consensus_mechanism not in acceptable_mechanisms:
            raise ValueError(f"Invalid consensus mechanism. Choose from {acceptable_mechanisms}")
        
        tool_response = None
        # Deliberation loop
        for i in range(rounds):
            added_tool_response = f"The following information were recieved: {tool_response}" if tool_response is not None else "" 
            
            initiation = self.initiator_agent.invoke(f"Initiator: Beginning round {i+1} / {rounds} of discussion. {added_tool_response}")
            
            logger.info(f"Initiator response: {initiation}")
            round_messages = []
            for idx,agent in enumerate(self.agents):
                agent.add_user_message(initiation)
                agent_response = agent.invoke(initiation)
                logger.info(f"Agent {idx} response: {agent_response}")
                round_messages.append(agent_response)
                self.update_agent_messages(agent_response, agent)
                self.information_manager.add_user_message(agent_response)
                self.initiator_agent.add_user_message(agent_response)
            
            final_round_message = "This is the final round " if (i == rounds -1) else ""
            summarizer_response = self.information_manager.invoke(f"{final_round_message},{build_summarizer_prompt_human(self.exercise.grading_criteria, self.submission, rounds, i)}")
            logger.info(f"Summarizer response: {summarizer_response}")
            tool_response = self.tool_agent.invoke(summarizer_response) # CALLS TOOLS
        # Consensus reaching
        return self.feedbacks
        pass
    def update_agent_messages(self, message, agent_creator):
        for agent in self.agents:
            if agent != agent_creator:
                agent.add_user_message(message)
                
    def end_deliberation(self):
        """This method indicates that consensus has been reached and the deliberation has ended."""
        self.deliberation_ended = True
    
    class FeedbackOllama():
        def __init__(self, title:str, description:str, credits:float, grading_instruction_id:int, line_start:int, line_end:int):
            self.title = title
            self.description = description
            self.credits = credits
            self.grading_instruction_id = grading_instruction_id
            self.line_start = line_start
            self.line_end = line_end
        def to_dict(self):
            return {
                "title": self.title,
                "description": self.description,
                "credits": self.credits,
                "grading_instruction_id": self.grading_instruction_id,
                "line_start": self.line_start,
                "line_end": self.line_end
            }
            
    def generate_suggestion(self, full_assessment: str):
        """Generates a suggestion and stores it in the agent's memory.

        Args:
            full_assessment (str): The full assessment to be generated.
        """
        # feedback = self.FeedbackOllama(title, description, credits, grading_instruction_id, line_start, line_end)
        # self.feedbacks.append(feedback)
        # pass it to another llm
        print("wow finalizing grading")
        print(f"the full assessment is: {full_assessment}")#
        feedbacks = json.loads(full_assessment)
            
        self.feedbacks = feedbacks

        # """_summary_

        # Args:
        #     title (str): The title of the grading instruction.
        #     credits (float): The credits to be awarded for the grading instruction.
        #     description (str): The description of the assessment
        #     grading_instruction_id (int): The id of the grading instruction.
        #     line_start (int): The starting reference line in the submission text.
        #     line_end (int): The ending reference line in the submission text.
        # """
import json
import xml.etree.ElementTree as ElementTree
from xml.dom import minidom

from athena.modelling import Submission
from module_modelling_llm.helpers.models.diagram_types import DiagramType
from module_modelling_llm.helpers.serializers.bpmn_serializer import BPMNSerializer


class DiagramModelSerializer:

    @staticmethod
    def serialize_model(model: dict) -> str:
        match model.get("type"):
            case DiagramType.CLASS_DIAGRAM:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.OBJECT_DIAGRAM:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.ACTIVITY_DIAGRAM:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.USE_CASE_DIAGRAM:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.COMMUNICATION_DIAGRAM:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.COMPONENT_DIAGRAM:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.DEPLOYMENT_DIAGRAM:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.PETRI_NET:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.REACHABILITY_GRAPH:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.SYNTAX_TREE:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.FLOWCHART:
                # TODO: Evaluate if there is a more sensible serialization format for this diagram type
                return json.dumps(model)
            case DiagramType.BPMN:
                serializer = BPMNSerializer()
                serialized_model: str = ElementTree.tostring(serializer.serialize(model, omit_layout_info=True), encoding='utf8')
                # The next line is only required to "pretty-print" the XML output for easier debugging
                return minidom.parseString(serialized_model).toprettyxml(indent="\t")

    @staticmethod
    def serialize_model_from_submission(submission: Submission) -> str:
        model: dict = json.loads(submission.model)
        return DiagramModelSerializer.serialize_model(model)

    @staticmethod
    def serialize_model_from_string(model_string: str) -> str:
        model: dict = json.loads(model_string)
        return DiagramModelSerializer.serialize_model(model)

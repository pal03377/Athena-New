import { getDefaultFormState } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";

import Form from "@/components/form";
import { getUISchema } from "@/components/form/utils";
import { ModuleConfigProps } from ".";

export default function ModuleLLMConfig({
  moduleConfig,
  configOptions,
  onChangeConfig,
}: ModuleConfigProps) {
  return (
    <>
      <Form
        schema={configOptions}
        validator={validator}
        onChange={(props) => {
          onChangeConfig(props.formData);
        }}
        formData={moduleConfig}
        liveValidate
        className="schema-form"
        uiSchema={{
          "ui:submitButtonOptions": {
            norender: true,
          },
          "ui:label": false,
          ...getUISchema(validator, configOptions, (property) => {
            if (property.includes("message")) {
              return {
                "ui:widget": "textarea",
                "ui:options": {
                  showLineNumbers: true,
                },
              };
            } else {
              return {};
            }
          }),
        }}
      />
      <button
        className="text-white bg-gray-500 hover:bg-gray-700 rounded-md p-2 border mt-2"
        onClick={() => {
          const defaultFormData = getDefaultFormState(
            validator,
            configOptions,
            {},
            configOptions
          );
          onChangeConfig(defaultFormData);
        }}
      >
        Reset
      </button>
    </>
  );
}

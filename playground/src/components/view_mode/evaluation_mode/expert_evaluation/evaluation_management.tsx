import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { downloadJSONFile } from "@/helpers/download";
import { twMerge } from "tailwind-merge";
import MetricsForm from "@/components/view_mode/evaluation_mode/expert_evaluation/metrics_form";
import { ExpertEvaluationConfig } from "@/model/expert_evaluation_config";
import EvaluationConfigSelector from "@/components/selectors/evaluation_config_selector";
import {
  EvaluationManagementExportImport
} from "@/components/view_mode/evaluation_mode/expert_evaluation/evaluation_management_export_import";
import {
  fetchAllExpertEvaluationConfigs,
  saveExpertEvaluationConfig as externalSaveExpertEvaluationConfig
} from "@/hooks/playground/expert_evaluation_config";
import ExpertLinks from "@/components/view_mode/evaluation_mode/expert_evaluation/expert_links";
import ExerciseImport from "@/components/view_mode/evaluation_mode/expert_evaluation/exercise_import";
import useDownloadExpertEvaluationData from "@/hooks/playground/expert_evaluation";

export default function EvaluationManagement() {
  const [expertEvaluationConfigs, setExpertEvaluationConfigs] = useState<ExpertEvaluationConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ExpertEvaluationConfig>({
    type: "evaluation_config",
    id: "new",
    name: "",
    started: false,
    creationDate: new Date(),
    metrics: [],
    exercises: [],
    expertIds: [],
  });
  const [secret, setSecret] = useState<string>("");
  const [isSecretValid, setIsSecretValid] = useState<boolean>(true);
  const dataMode = "expert_evaluation";

  useEffect(() => {
    const fetchData = async () => {
      const savedConfigs = await fetchAllExpertEvaluationConfigs(dataMode);
      setExpertEvaluationConfigs(savedConfigs);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedConfig.id === "new") {
      setSelectedConfig((prevConfig) => ({
        ...prevConfig,
        id: uuidv4(),
        name: "",
        started: false,
        creationDate: new Date(),
        metrics: [],
        exercises: [],
        expertIds: [],
      }));
    } else {
      const existingConfig = expertEvaluationConfigs.find((config) => config.id === selectedConfig.id);
      if (existingConfig) setSelectedConfig(existingConfig);
    }
  }, [selectedConfig.id, expertEvaluationConfigs]);

  const saveExpertEvaluationConfig = (newConfig: ExpertEvaluationConfig) => {
    setExpertEvaluationConfigs((prevConfigs) => {
      const existingIndex = prevConfigs.findIndex((config) => config.id === newConfig.id);
      if (existingIndex !== -1) {
        const updatedConfigs = [...prevConfigs];
        updatedConfigs[existingIndex] = newConfig;
        return updatedConfigs;
      } else {
        return [...prevConfigs, newConfig];
      }
    });
    setSelectedConfig(newConfig);
    externalSaveExpertEvaluationConfig(dataMode, newConfig);
  };

  const handleExport = () => {
    downloadJSONFile(`evaluation_config_${selectedConfig.name}_${selectedConfig.id}`, selectedConfig);
  };

  const handleImport = async (fileContent: string) => {
    const importedConfig = JSON.parse(fileContent) as ExpertEvaluationConfig;
    if (importedConfig.type !== "evaluation_config") {
      alert("Invalid config type");
      return;
    }
    importedConfig.id = uuidv4();
    importedConfig.creationDate = new Date();
    importedConfig.started = false;
    importedConfig.expertIds = [];
    saveExpertEvaluationConfig(importedConfig);
  };

  const { mutate: downloadEvaluationData, isLoading: isExporting } = useDownloadExpertEvaluationData({
    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `evaluation_${selectedConfig.id}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      if (error.status === 401) {
        setIsSecretValid(false);
      } else {
        console.error("Download failed:", error.message);
        alert("An error occurred during download. Please try again later.");
      }
    },
  });

  const startEvaluation = () => {
    if (confirm("Are you sure you want to start the evaluation? Once started, no further changes can be made to the configuration!")) {
      setSelectedConfig((prevConfig) => ({ ...prevConfig, started: true }));
      saveExpertEvaluationConfig({ ...selectedConfig, started: true });
    }
  };

  const inputDisabledStyle = selectedConfig.started
    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
    : "";

  return (
    <div className="bg-white rounded-md p-4 mb-8 space-y-4">
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-2xl font-bold">Manage Evaluations</h3>
        <EvaluationManagementExportImport
          definedExpertEvaluationConfig={selectedConfig}
          handleExport={handleExport}
          handleImport={handleImport}
        />
      </div>

      <EvaluationConfigSelector
        selectedConfigId={selectedConfig.id}
        setSelectedConfigId={(id) => setSelectedConfig((prevConfig) => ({ ...prevConfig, id }))}
        expertEvaluationConfigs={expertEvaluationConfigs}
      />

      <label className="flex flex-col">
        <span className="text-lg font-bold mb-2">Evaluation Name</span>
        <input
          type="text"
          placeholder="Enter a name for the evaluation."
          className={`border border-gray-300 rounded-md p-2 ${inputDisabledStyle}`}
          value={selectedConfig.name}
          onChange={(e) => {
            if (!selectedConfig.started) {
              const updatedConfig = { ...selectedConfig, name: e.target.value };
              setSelectedConfig(updatedConfig);
              saveExpertEvaluationConfig(updatedConfig);
            }
          }}
          disabled={selectedConfig.started}
        />
      </label>

      <ExerciseImport
        exercises={selectedConfig.exercises}
        setExercises={(newExercises) => {
          if (!selectedConfig.started) {
            const updatedConfig = { ...selectedConfig, exercises: newExercises };
            setSelectedConfig(updatedConfig);
            saveExpertEvaluationConfig(updatedConfig);
          }
        }}
        disabled={selectedConfig.started}
      />

      <MetricsForm
        metrics={selectedConfig.metrics}
        setMetrics={(newMetrics) => {
          if (!selectedConfig.started) {
            const updatedConfig = { ...selectedConfig, metrics: newMetrics };
            setSelectedConfig(updatedConfig);
            saveExpertEvaluationConfig(updatedConfig);
          }
        }}
        disabled={selectedConfig.started}
      />

      <ExpertLinks
        expertIds={selectedConfig.expertIds!}
        setExpertIds={(newExpertIds) => {
          const updatedConfig = { ...selectedConfig, expertIds: newExpertIds };
          setSelectedConfig(updatedConfig);
          saveExpertEvaluationConfig(updatedConfig);
        }}
        started={selectedConfig.started}
        configId={selectedConfig.id}
      />

      {selectedConfig.started && (
        <>
          <label className="flex flex-col">
            <span className="text-lg font-bold mb-2">Playground Secret</span>
            <input
              type="text"
              placeholder="Enter the playground secret to download the evaluation data."
              className={`border ${isSecretValid ? "border-gray-300" : "border-red-500"} rounded-md p-2`}
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                setIsSecretValid(true);
              }}
            />
            {!isSecretValid && (
              <span className="text-xs text-red-500 mt-1">The secret is incorrect, please try again!</span>
            )}
          </label>

          <button
            className="bg-blue-500 text-white rounded-md p-2 mt-2 hover:bg-blue-600"
            onClick={() => downloadEvaluationData({ configId: selectedConfig.id, secret })}
            disabled={isExporting}
          >
            {isExporting ? "Downloading..." : "Download Results"}
          </button>
        </>
      )}

      {!selectedConfig.started && (
        <div className="flex flex-row gap-2">
          <button
            className={twMerge(
              "bg-primary-500 text-white rounded-md p-2 mt-2 hover:bg-primary-600",
              !selectedConfig ? "disabled:text-gray-500 disabled:bg-gray-200 disabled:cursor-not-allowed" : ""
            )}
            onClick={() => saveExpertEvaluationConfig(selectedConfig)}
            disabled={!selectedConfig}
          >
            {selectedConfig.id === "new" ? "Define Experiment" : "Save Changes"}
          </button>

          <button
            className="bg-green-500 text-white rounded-md p-2 mt-2 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            onClick={startEvaluation}
            disabled={!selectedConfig}
          >
            Start Evaluation
          </button>
        </div>
      )}
    </div>
  );
}
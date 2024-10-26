import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { downloadJSONFile } from "@/helpers/download";
import { twMerge } from "tailwind-merge";
import MetricsForm from "@/components/view_mode/evaluation_mode/expert_evaluation/metrics_form";
import { Exercise } from "@/model/exercise";
import { ExpertEvaluationConfig } from "@/model/expert_evaluation_config";
import { Metric } from "@/model/metric";
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
  const [selectedConfigId, setSelectedConfigId] = useState<string>("new");
  const [name, setName] = useState<string>("");
  const [started, setStarted] = useState<boolean>(false); // Controls if the experiment is locked
  const [creationDate, setCreationDate] = useState<Date | undefined>(undefined);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [expertIds, setExpertIds] = useState<string[]>([]);
  const [secret, setSecret] = useState<string>("");
  const [isSecretValid, setIsSecretValid] = useState<boolean>(true);
  const dataMode = 'expert_evaluation';

  useEffect(() => {
    const fetchData = async () => {
      const savedConfigs = await fetchAllExpertEvaluationConfigs(dataMode);
      setExpertEvaluationConfigs(savedConfigs);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedConfigId === "new") {
      setSelectedConfigId(uuidv4());
      setName("");
      setStarted(false);
      setCreationDate(new Date());
      setMetrics([]);
      setExercises([]);
      setExpertIds([]);
    } else {
      const selectedConfig = expertEvaluationConfigs.find((config) => config.id === selectedConfigId);
      if (selectedConfig) {
        setSelectedConfigId(selectedConfig.id);
        setName(selectedConfig.name);
        setStarted(selectedConfig.started);
        setCreationDate(selectedConfig.creationDate);
        setMetrics(selectedConfig.metrics);
        setExercises(selectedConfig.exercises);
        setExpertIds(selectedConfig.expertIds || []);
      }
    }
  }, [selectedConfigId, expertEvaluationConfigs]);

  const getSelectedConfig = (): ExpertEvaluationConfig => {
    if (selectedConfigId === "new") {
      return {
        started,
        creationDate: creationDate || new Date(),
        type: "evaluation_config",
        id: uuidv4(),
        name,
        metrics,
        exercises,
        expertIds,
      };
    } else {
      return (
        expertEvaluationConfigs.find((config) => config.id === selectedConfigId) || {
          started: false,
          creationDate: new Date(),
          type: "evaluation_config",
          id: uuidv4(),
          name: "",
          metrics: [],
          exercises: [],
          expertIds: [],
        }
      );
    }
  };

  const definedExpertEvaluationConfig = getSelectedConfig();

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
    setSelectedConfigId(newConfig.id);

    externalSaveExpertEvaluationConfig(dataMode, newConfig);
  };

  const handleExport = () => {
    const configToExport = definedExpertEvaluationConfig;
    if (!configToExport) return;
    downloadJSONFile(`evaluation_config_${configToExport.name}_${configToExport.id}`, configToExport);
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
      a.download = `evaluation_${selectedConfigId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (error: { status: number; message: any; }) => {
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
      setStarted(true);
      saveExpertEvaluationConfig({ ...definedExpertEvaluationConfig, started: true });
    }
  };

  const inputDisabledStyle = started
    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
    : "";

  return (
    <div className="bg-white rounded-md p-4 mb-8 space-y-4">
      <div className="flex flex-row justify-between items-center">
        <h3 className="text-2xl font-bold">Manage Evaluations</h3>
        <EvaluationManagementExportImport
          definedExpertEvaluationConfig={definedExpertEvaluationConfig}
          handleExport={handleExport}
          handleImport={handleImport}
        />
      </div>

      <EvaluationConfigSelector
        selectedConfigId={selectedConfigId}
        setSelectedConfigId={setSelectedConfigId}
        expertEvaluationConfigs={expertEvaluationConfigs}
      />

      <label className="flex flex-col">
        <span className="text-lg font-bold mb-2">Evaluation Name</span>
        <input
          type="text"
          placeholder="Enter a name for the evaluation."
          className={`border border-gray-300 rounded-md p-2 ${inputDisabledStyle}`}
          value={name}
          onChange={(e) => {
            if (!started) {
              setName(e.target.value);
              if (selectedConfigId !== "new") {
                saveExpertEvaluationConfig({ ...definedExpertEvaluationConfig, name: e.target.value });
              }
            }
          }}
          disabled={started}
        />
      </label>

      <ExerciseImport
        exercises={exercises}
        setExercises={(newExercises: Exercise[]) => {
          if (!started) {
            setExercises(newExercises);
            if (selectedConfigId !== "new") {
              saveExpertEvaluationConfig({ ...definedExpertEvaluationConfig, exercises: newExercises });
            }
          }
        }}
        disabled={started}
      />

      <MetricsForm
        metrics={metrics}
        setMetrics={(newMetrics) => {
          if (!started) {
            setMetrics(newMetrics);
            if (selectedConfigId !== "new") {
              saveExpertEvaluationConfig({ ...definedExpertEvaluationConfig, metrics: newMetrics });
            }
          }
        }}
        disabled={started}
      />

      <ExpertLinks
        expertIds={expertIds}
        setExpertIds={(newExpertIds) => {
          setExpertIds(newExpertIds);
          if (selectedConfigId !== "new") {
            saveExpertEvaluationConfig({ ...definedExpertEvaluationConfig, expertIds: newExpertIds });
          }
        }}
        started={started}
        configId={selectedConfigId}
      />

      {started && (
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
            onClick={() => downloadEvaluationData({ configId: selectedConfigId, secret })}
            disabled={isExporting}
          >
            {isExporting ? "Downloading..." : "Download Results"}
          </button>
        </>
      )}

      {!started && (
        <div className="flex flex-row gap-2">
          <button
            className={twMerge(
              "bg-primary-500 text-white rounded-md p-2 mt-2 hover:bg-primary-600",
              !definedExpertEvaluationConfig
                ? "disabled:text-gray-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                : ""
            )}
            onClick={() => {
              if (definedExpertEvaluationConfig) {
                saveExpertEvaluationConfig(definedExpertEvaluationConfig);
              }
            }}
            disabled={!definedExpertEvaluationConfig}
          >
            {selectedConfigId === "new" ? "Define Experiment" : "Save Changes"}
          </button>

          <button
            className="bg-green-500 text-white rounded-md p-2 mt-2 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            onClick={startEvaluation}
            disabled={!definedExpertEvaluationConfig}
          >
            Start Evaluation
          </button>
        </div>
      )}
    </div>
  );
}
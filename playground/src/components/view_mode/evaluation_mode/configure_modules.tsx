import type { ModuleMeta } from "@/model/health_response";
import type { Experiment } from "./define_experiment";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";

import ModuleAndConfigSelect from "@/components/selectors/module_and_config_select";
import { twMerge } from "tailwind-merge";

export type ModuleConfiguration = {
  id: string;
  name: string;
  moduleAndConfig: { module: ModuleMeta; moduleConfig: any };
};

type ConfigureModulesProps = {
  experiment: Experiment;
  moduleConfigurations: ModuleConfiguration[] | undefined;
  onChangeModuleConfigurations: (
    moduleConfigurations: ModuleConfiguration[] | undefined
  ) => void;
};

export default function ConfigureModules({
  experiment,
  moduleConfigurations,
  onChangeModuleConfigurations,
}: ConfigureModulesProps) {
  const [moduleConfigurationsState, setModuleConfigurationsState] = useState<
    {
      id: string;
      name: string;
      moduleAndConfig: { module: ModuleMeta; moduleConfig: any } | undefined;
    }[]
  >(moduleConfigurations ?? []);

  const [disablePrev, setDisablePrev] = useState(true);
  const [disableNext, setDisableNext] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const slider = scrollRef.current;
    setDisablePrev(slider.scrollLeft === 0);
    setDisableNext(
      slider.scrollLeft === slider.scrollWidth - slider.clientWidth
    );
  };

  const slide = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    const moveAmount = scrollRef.current.clientWidth * 0.4;
    const slider = scrollRef.current;

    if (
      direction === "next" &&
      slider.scrollLeft < slider.scrollWidth - slider.clientWidth
    ) {
      slider.scrollBy({ left: moveAmount, behavior: "smooth" });
    } else if (direction === "prev" && slider.scrollLeft > 0) {
      slider.scrollBy({ left: -moveAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkScroll();
  }, [moduleConfigurationsState]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const scroll = scrollRef.current;
    scroll.addEventListener("scroll", checkScroll);
    return () => scroll.removeEventListener("scroll", checkScroll);
  }, [scrollRef]);

  const configurationsStatus = moduleConfigurationsState.map(
    (moduleConfiguration) => {
      const isModuleEmpty = moduleConfiguration.moduleAndConfig === undefined;
      const isDuplicateName =
        moduleConfigurationsState.filter(
          (currentModuleConfiguration) =>
            currentModuleConfiguration.name === moduleConfiguration.name
        ).length > 1;
      const isNameEmpty = moduleConfiguration.name === "";
      return {
        id: moduleConfiguration.id,
        isValid: !isModuleEmpty && !isDuplicateName && !isNameEmpty,
        isModuleEmpty,
        isDuplicateName,
        isNameEmpty,
      };
    }
  );

  const handleExport = () => {
    moduleConfigurationsState.forEach((config, index) => {
      setTimeout(() => {
        const blob = new Blob([JSON.stringify(config, null, 2)], {
          type: "text/json",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        let name = config.name.toLowerCase().replace(/\s+/g, "_");
        name = name.replace(/[\\/:"*?<>|]+/g, "").replace(/_+/g, "_");
        link.download = `module_config_${name}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, index * 1000);
    });
  };

  return (
    <div className="bg-white rounded-md p-4 mb-8 space-y-2">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <h3 className="text-2xl font-bold">Configure Modules</h3>
          {configurationsStatus.some((status) => !status.isValid) && (
            <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">
              {configurationsStatus.filter((status) => !status.isValid).length}{" "}
              Invalid
            </span>
          )}
        </div>
        <div className="flex flex-row gap-2">
          {configurationsStatus.every((status) => status.isValid) &&
            configurationsStatus.length > 0 && (
              <button
                className="rounded-md p-2 text-primary-500 hover:text-primary-600 hover:bg-gray-100 hover:no-underline"
                onClick={handleExport}
              >
                Export
              </button>
            )}
          <label
            className={twMerge(
              "rounded-md p-2",
              moduleConfigurations !== undefined
                ? "text-gray-500 cursor-not-allowed"
                : "text-primary-500 hover:text-primary-600 hover:bg-gray-100"
            )}
          >
            Import
            <input
              multiple
              disabled={moduleConfigurations !== undefined}
              className="hidden"
              type="file"
              onChange={(e) => {
                if (!e.target.files) return;

                Array.from(e.target.files).forEach((file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    if (e.target && typeof e.target.result === "string") {
                      const moduleConfiguration = JSON.parse(
                        e.target.result
                      ) as ModuleConfiguration;
                      const existingConfiguration =
                        moduleConfigurationsState.find(
                          (config) => config.id === moduleConfiguration.id
                        );
                      if (!existingConfiguration) {
                        setModuleConfigurationsState((prevState) => [
                          ...prevState,
                          moduleConfiguration,
                        ]);
                        alert(`Imported ${moduleConfiguration.name}`);
                      } else {
                        alert(
                          `Module configuration with id: ${existingConfiguration.id} and name: ${existingConfiguration.name} already exists`
                        );
                      }
                    }
                  };
                  reader.readAsText(file);
                });
              }}
            />
          </label>
          <button
            onClick={() => slide("prev")}
            disabled={disablePrev}
            className="bg-primary-500 text-white rounded-md p-2 hover:bg-primary-600 disabled:text-gray-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            onClick={() => slide("next")}
            disabled={disableNext}
            className="bg-primary-500 text-white rounded-md p-2 hover:bg-primary-600 disabled:text-gray-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      <div
        className="w-full flex gap-4 snap-x snap-mandatory overflow-x-auto max-h-[calc(100vh-10rem)] mb-1 pb-4"
        ref={scrollRef}
      >
        {moduleConfigurationsState?.map((moduleConfiguration, index) => (
          <div
            key={moduleConfiguration.id}
            className="flex flex-col shrink-0 snap-start overflow-y-auto z-20"
          >
            <div className="shrink-0 w-[calc(50vw-8rem)]">
              <div className="sticky top-0 bg-white border-b border-gray-300 z-10 px-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold">
                    Configuration&nbsp;{index + 1}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {index === 0 && (
                      <span className="rounded-full bg-indigo-500 text-white px-2 py-0.5 text-xs">
                        Submission Selector (First)
                      </span>
                    )}
                    {configurationsStatus[index].isValid ? (
                      <span className="rounded-full bg-green-500 text-white px-2 py-0.5 text-xs">
                        Valid
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">
                        Invalid
                      </span>
                    )}
                    {configurationsStatus[index].isModuleEmpty && (
                      <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">
                        No module selected
                      </span>
                    )}
                    {configurationsStatus[index].isNameEmpty ? (
                      <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">
                        No name
                      </span>
                    ) : (
                      configurationsStatus[index].isDuplicateName && (
                        <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">
                          Duplicate module name
                        </span>
                      )
                    )}
                  </div>
                  <div className="flex flex-1 justify-end gap-1 mb-1 self-start">
                    <button
                      disabled={index === 0}
                      className="w-8 h-8 rounded-md p-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-500 hover:text-gray-600 text-base leading-none disabled:text-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setModuleConfigurationsState((prevState) => {
                          const newState = [...prevState];
                          const temp = newState[index - 1];
                          newState[index - 1] = newState[index];
                          newState[index] = temp;
                          return newState;
                        })
                        slide("prev");
                      }}
                    >
                      ←
                    </button>
                    <button
                      disabled={index === moduleConfigurationsState.length - 1}
                      className="w-8 h-8 rounded-md p-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-500 hover:text-gray-600 text-base leading-none disabled:text-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setModuleConfigurationsState((prevState) => {
                          const newState = [...prevState];
                          const temp = newState[index + 1];
                          newState[index + 1] = newState[index];
                          newState[index] = temp;
                          return newState;
                        })
                        slide("next");
                      }}
                    >
                      →
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    disabled={moduleConfigurations !== undefined}
                    placeholder="Configuration name"
                    className="w-full rounded-md p-2 border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={moduleConfiguration.name}
                    onChange={(e) => {
                      const newModuleConfigurations =
                        moduleConfigurationsState?.map(
                          (currentModuleConfiguration) => {
                            if (
                              currentModuleConfiguration.id ===
                              moduleConfiguration.id
                            ) {
                              return {
                                ...currentModuleConfiguration,
                                name: e.target.value,
                              };
                            }
                            return currentModuleConfiguration;
                          }
                        );
                      setModuleConfigurationsState(newModuleConfigurations);
                    }}
                  />
                  {moduleConfigurations === undefined && (
                    <>
                      <button
                        onClick={() => {
                          let newName = `${moduleConfiguration.name} (copy)`;
                          let num = 1;
                          while (
                            moduleConfigurationsState.filter(
                              (currentModuleConfiguration) =>
                                currentModuleConfiguration.name === newName
                            ).length > 0
                          ) {
                            newName = `${moduleConfiguration.name} (copy ${num})`;
                          }

                          const newModuleConfiguration = {
                            ...moduleConfiguration,
                            id: uuidv4(),
                            name: newName,
                          };
                          // insert after current index
                          const newModuleConfigurations = [
                            ...moduleConfigurationsState.slice(0, index + 1),
                            newModuleConfiguration,
                            ...moduleConfigurationsState.slice(index + 1),
                          ];
                          setModuleConfigurationsState(newModuleConfigurations);
                          slide("next");
                        }}
                        className="bg-primary-500 text-white rounded-md p-2 hover:bg-primary-600"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete?")) {
                            const newModuleConfigurations =
                              moduleConfigurationsState?.filter(
                                (currentModuleConfiguration) => {
                                  return (
                                    currentModuleConfiguration.id !==
                                    moduleConfiguration.id
                                  );
                                }
                              );
                            setModuleConfigurationsState(
                              newModuleConfigurations
                            );
                            slide("prev");
                          }
                        }}
                        className="bg-red-500 text-white rounded-md p-2 hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="px-2">
                <ModuleAndConfigSelect
                  disabled={moduleConfigurations !== undefined}
                  exerciseType={experiment.exerciseType}
                  moduleAndConfig={moduleConfiguration.moduleAndConfig}
                  onChangeModuleAndConfig={(newModuleAndConfig) => {
                    const newModuleConfigurations =
                      moduleConfigurationsState?.map(
                        (currentModuleConfiguration) => {
                          if (
                            currentModuleConfiguration.id ===
                            moduleConfiguration.id
                          ) {
                            return {
                              ...currentModuleConfiguration,
                              moduleAndConfig: newModuleAndConfig,
                            };
                          }
                          return currentModuleConfiguration;
                        }
                      );
                    setModuleConfigurationsState(newModuleConfigurations);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        {moduleConfigurations === undefined && (
          <div className="flex flex-col shrink-0 snap-start px-2">
            <div className="shrink-0 w-[calc(50vw-8rem)]">
              <button
                onClick={() => {
                  const newModuleConfigurations = [
                    ...moduleConfigurationsState,
                    {
                      id: uuidv4(),
                      name: "",
                      moduleAndConfig: undefined,
                    },
                  ];
                  setModuleConfigurationsState(newModuleConfigurations);
                }}
                className="h-32 w-full p-2 border-2 border-primary-400 border-dashed text-primary-500 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-500 rounded-lg font-medium"
              >
                Add configuration
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row gap-2">
        <button
          className={twMerge(
            "bg-primary-500 text-white rounded-md p-2 mt-2 hover:bg-primary-600 disabled:cursor-not-allowed",
            (moduleConfigurations?.length ?? 0) > 0
              ? "disabled:bg-green-100 disabled:text-green-600"
              : "disabled:text-gray-500 disabled:bg-gray-200"
          )}
          disabled={
            moduleConfigurations !== undefined ||
            moduleConfigurationsState.length === 0 ||
            configurationsStatus.some(
              (configurationStatus) => !configurationStatus.isValid
            )
          }
          onClick={() => {
            if (
              configurationsStatus.every(
                (configurationStatus) => configurationStatus.isValid
              )
            ) {
              onChangeModuleConfigurations(
                moduleConfigurationsState as ModuleConfiguration[]
              );
            }
          }}
        >
          {(moduleConfigurations?.length ?? 0) > 0
            ? "Configurations Defined"
            : "Define Configurations"}
        </button>
        {moduleConfigurations && (
          <button
            className="bg-red-500 text-white rounded-md p-2 mt-2 hover:bg-red-600"
            onClick={() => {
              if (moduleConfigurations && confirm("Cancel experiment?")) {
                onChangeModuleConfigurations(undefined);
              }
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

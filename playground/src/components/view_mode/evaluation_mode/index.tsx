import type {Experiment} from "./define_experiment";
import DefineExperiment from "./define_experiment";
import type {ModuleConfiguration} from "./configure_modules";
import ConfigureModules from "./configure_modules";

import {useEffect, useState} from "react";
import ConductExperiment from "./conduct_experiment";
import EvaluationManagement from "@/components/view_mode/evaluation_mode/expert_evaluation/evaluation_management";
import {authorizeExpertEvaluationManagement} from "@/hooks/playground/expert_evaluation_management";

interface EvaluationModeProps {
    athenaSecret: string;
}

export default function EvaluationMode({athenaSecret}: EvaluationModeProps) {
    const [experiment, setExperiment] = useState<Experiment | undefined>(
        undefined
    );
    const [moduleConfigurations, setModuleConfigurations] = useState<
        ModuleConfiguration[] | undefined
    >(undefined);

    const [isSecretValid, setIsSecretValid] = useState<boolean>(true);

    useEffect(() => {
        const authorize = async () => {
            const response = await authorizeExpertEvaluationManagement(athenaSecret);
            if (response == 401) {
                setIsSecretValid(false);
            } else {
                setIsSecretValid(true);
            }
        };
        authorize();
    }, [athenaSecret]);

    return (
        <>
            <h2 className="text-4xl font-bold text-white mb-4">Evaluation Mode</h2>
            <DefineExperiment
                experiment={experiment}
                onChangeExperiment={(experiment) => {
                    setExperiment(experiment);
                    setModuleConfigurations(undefined);
                }}
            />
            {experiment && (
                <>
                    <ConfigureModules
                        experiment={experiment}
                        moduleConfigurations={moduleConfigurations}
                        onChangeModuleConfigurations={setModuleConfigurations}
                    />
                    {moduleConfigurations && (
                        <ConductExperiment
                            experiment={experiment}
                            moduleConfigurations={moduleConfigurations}
                        />
                    )}
                </>
            )}

            {isSecretValid && (
                <>
                    <h2 className="text-4xl font-bold text-white mb-4">Expert Evaluation</h2>
                    <EvaluationManagement/>
                </>)}
        </>
    );
}

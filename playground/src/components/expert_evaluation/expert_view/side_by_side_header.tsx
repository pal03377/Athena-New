import React, {useEffect, useState} from 'react';
import Popup from "@/components/expert_evaluation/expert_view/popup";
import {Metric} from "@/model/metric";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import ExerciseDetail from "@/components/details/exercise_detail";

type SideBySideHeaderProps = {
    exercise: any;
    globalSubmissionIndex: number;
    totalSubmissions: number;
    metrics: Metric[];
    hasStartedEvaluating: boolean;
    onNext: () => void;
    onPrevious: () => void;
    onContinueLater: () => void;
}

export default function SideBySideHeader({
                                             exercise,
                                             globalSubmissionIndex,
                                             totalSubmissions,
                                             metrics,
                                             hasStartedEvaluating,
                                             onNext,
                                             onPrevious,
                                             onContinueLater,
                                         }: SideBySideHeaderProps) {
    const [isExerciseDetailOpen, setIsExerciseDetailOpen] = useState<boolean>(false);
    const [isMetricDetailOpen, setIsMetricDetailOpen] = useState<boolean>(false);
    const [isEvaluationTutorialOpen, setIsEvaluationTutorialOpen] = useState<boolean>(false);

    const openExerciseDetail = () => setIsExerciseDetailOpen(true);
    const closeExerciseDetail = () => setIsExerciseDetailOpen(false);
    const openMetricDetail = () => setIsMetricDetailOpen(true);
    const closeMetricDetail = () => setIsMetricDetailOpen(false);
    const openEvaluationTutorial = () => setIsEvaluationTutorialOpen(true);
    const closeEvaluationTutorial = () => setIsEvaluationTutorialOpen(false);

    useEffect(() => {
        openExerciseDetail();
    }, [exercise]);

    useEffect(() => {
        if (!hasStartedEvaluating) {
            openEvaluationTutorial();
        }

    }, [hasStartedEvaluating]);

    if (!exercise) {
        return <div>Loading...</div>;
    }

    // Reusable button styles
    const buttonBase = "px-4 py-1.5 rounded-md transition";
    const buttonPrimary = `${buttonBase} bg-blue-500 text-white hover:bg-blue-600`;
    const buttonSecondary = `${buttonBase} bg-gray-300 text-gray-700 hover:bg-gray-400`;
    const buttonFinish = `${buttonBase} bg-green-600 text-white hover:bg-green-700`;

    return (
        <div className="mb-4 sticky top-0 z-10 bg-white"> {/* Sticky header */}
            {/* Subtitle and Details Buttons Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">

                {/* Align heading to the top */}
                <div className="flex flex-col gap-2 w-full md:w-auto self-start">
                    <h1 className="text-xl font-semibold text-gray-900">
                        Evaluation: {exercise.title}
                    </h1>

                    {/* Details Buttons */}
                    <div className="flex flex-col md:flex-row gap-2 w-full">
                        <button className={buttonSecondary} onClick={openExerciseDetail}>
                            📄 Exercise Details
                        </button>
                        <Popup isOpen={isExerciseDetailOpen} onClose={closeExerciseDetail}
                               title={`Exercise Details: ${exercise.title}`}>
                            <ExerciseDetail exercise={exercise} hideDisclosure={true} openedInitially={true}/>
                        </Popup>

                        <button className={buttonSecondary} onClick={openMetricDetail}>
                            📊 Metric Details
                        </button>
                        <Popup isOpen={isMetricDetailOpen} onClose={closeMetricDetail} title="Metric Details">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {metrics.map((metric, index) => (
                                    <div key={index} className="border border-gray-300 rounded-md p-4">
                                        <h2 className="font-semibold mb-4">{metric.title}</h2>
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose-sm">
                                            {metric.description}
                                        </ReactMarkdown>
                                    </div>
                                ))}
                            </div>
                        </Popup>

                        <button className={buttonSecondary} onClick={openEvaluationTutorial}>
                            📚 Evaluation Tutorial
                        </button>
                        <Popup isOpen={isEvaluationTutorialOpen} onClose={closeEvaluationTutorial}
                               title="Evaluation Tutorial">
                            Some placeholder pictures
                        </Popup>
                    </div>
                </div>

                {/* Align buttons to the end */}
                <div className="flex flex-col items-end gap-2 mt-4 md:mt-0 w-full md:w-[250px] self-end">
                    <button
                        className={`${buttonSecondary} w-full`}
                        onClick={onContinueLater}
                    >
                        😴 Continue Later
                    </button>

                    {/* Wrapping buttons to match the width */}
                    <div className="flex gap-2 w-full md:w-[250px]">
                        <button
                            className={`${buttonPrimary} w-full`}
                            onClick={onPrevious}
                            disabled={globalSubmissionIndex === 0}
                        >
                            ⬅️ Previous
                        </button>
                        <button
                            className={`${globalSubmissionIndex === totalSubmissions - 1
                                    ? buttonFinish
                                    : buttonPrimary
                            } w-full`}
                            onClick={onNext}
                        >
                            {globalSubmissionIndex === totalSubmissions - 1 ? 'Finish 🏁' : 'Next ➡️'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full bg-gray-300 h-2 rounded">
                <div
                    className="bg-blue-500 h-2 rounded"
                    style={{width: `${(globalSubmissionIndex + 1) / totalSubmissions * 100}%`}}
                />
            </div>
            <span className="text-sm text-gray-700">
                {globalSubmissionIndex + 1} / {totalSubmissions}
            </span>
        </div>
    );
}

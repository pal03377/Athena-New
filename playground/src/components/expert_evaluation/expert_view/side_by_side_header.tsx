import React, { useState } from 'react';
import Popup from "@/components/expert_evaluation/expert_view/popup";

type SideBySideHeaderProps = {
    exercise: any;
    globalSubmissionIndex: number;
    totalSubmissions: number;
    onNext: () => void;
    onPrevious: () => void;
}

export default function SideBySideHeader({
    exercise,
    globalSubmissionIndex,
    totalSubmissions,
    onNext,
    onPrevious,
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

    if (!exercise) {
        return <div>Loading...</div>;
    }

    // Reusable button styles
    const buttonBase = "px-4 py-1.5 rounded-md transition";
    const buttonPrimary = `${buttonBase} bg-blue-500 text-white hover:bg-blue-600`;
    const buttonSecondary = `${buttonBase} bg-gray-300 text-gray-700 hover:bg-gray-400`;

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
                        <Popup isOpen={isExerciseDetailOpen} onClose={closeExerciseDetail} title="Exercise Details">
                            <p><b>Exercise Problem Statement</b></p>
                            <p>{exercise.problem_statement}</p>
                            <p><b>Sample Solution</b></p>
                            <p>{exercise.example_solution}</p>
                        </Popup>

                        <button className={buttonSecondary} onClick={openMetricDetail}>
                            📊 Metric Details
                        </button>
                        <Popup isOpen={isMetricDetailOpen} onClose={closeMetricDetail} title="Metric Details">
                            TODO add metrics description
                        </Popup>

                        <button className={buttonSecondary} onClick={openEvaluationTutorial}>
                            📚 Evaluation Tutorial
                        </button>
                        <Popup isOpen={isEvaluationTutorialOpen} onClose={closeEvaluationTutorial} title="Evaluation Tutorial">
                            This is how you do the evaluation: ...
                        </Popup>
                    </div>
                </div>

                {/* Align buttons to the end */}
                <div className="flex flex-col items-end gap-2 mt-4 md:mt-0 w-full md:w-[250px] self-end">
                    <button className={`${buttonSecondary} w-full`}>
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
                            className={`${buttonPrimary} w-full`}
                            onClick={onNext}
                            disabled={globalSubmissionIndex === totalSubmissions - 1}
                        >
                            Next ➡️
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full bg-gray-300 h-2 rounded">
                <div
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${(globalSubmissionIndex + 1) / totalSubmissions * 100}%` }}
                />
            </div>
            <span className="text-sm text-gray-700">
                {globalSubmissionIndex + 1} / {totalSubmissions}
            </span>
        </div>
    );
}

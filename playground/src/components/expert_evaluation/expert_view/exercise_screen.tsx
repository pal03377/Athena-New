import React, {useState} from 'react';
import ExerciseDetailPopup from "@/components/expert_evaluation/expert_view/exercise_detail_popup";
import {Exercise} from "@/model/exercise";
import background_image from "@/assets/start2.webp";


interface ExerciseScreenProps {
    onCloseExerciseDetail: () => void;
    onOpenContinueLater: () => void;
    exercise: Exercise;
    currentExerciseIndex: number;
    totalExercises: number;
}

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
                                                           onCloseExerciseDetail,
                                                           onOpenContinueLater,
                                                           exercise,
                                                           currentExerciseIndex,
                                                           totalExercises
                                                       }) => {
    const [isExerciseDetailOpen, setExerciseDetailOpen] = useState(false);

    // Function to close the ExerciseDetailPopup
    const closeExerciseDetail = () => {
        setExerciseDetailOpen(false);
        onCloseExerciseDetail();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
             style={{
                 backgroundImage: `url(${background_image.src})`, // Use the same path as in tailwind.config.js
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}
        >
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
                <h1 className="text-4xl font-bold mb-4">You have
                    evaluated {currentExerciseIndex}/{totalExercises} exercises!</h1>
                <p className="text-lg mb-6">
                    Great job! Feel free to take a break and
                    continue later. Your progress has been saved.
                </p>
                <p className="text-lg mb-6">
                    When you are ready, continue with the next exercise: {exercise.title}.
                </p>
                <button
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600"
                    onClick={onOpenContinueLater}
                >
                    😴 Continue Later
                </button>

                <button
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 ml-4"
                    onClick={() => setExerciseDetailOpen(true)} // Open the ExerciseDetailPopup
                >
                    📄 Exercise Details
                </button>
            </div>
            {/* ExerciseDetailPopup that shows up when isExerciseDetailOpen is true */}
            <ExerciseDetailPopup
                isOpen={isExerciseDetailOpen}
                onClose={closeExerciseDetail}
                exercise={exercise}
            />
        </div>
    );
};

export default ExerciseScreen;
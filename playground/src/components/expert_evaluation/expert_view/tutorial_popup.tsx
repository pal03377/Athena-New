// src/components/ExerciseDetailPopup.tsx
import React, {useState} from 'react';
import Popup from "@/components/expert_evaluation/expert_view/popup";
import exerciseDetails from "@/assets/evaluation_tutorial/exercise_details.gif";
import readSubmission from "@/assets/evaluation_tutorial/read_submission.gif";
import evaluateMetrics from "@/assets/evaluation_tutorial/evaluate_metrics.gif";
import metricsExplanation from "@/assets/evaluation_tutorial/metrics-explanation.gif";
import viewNext from "@/assets/evaluation_tutorial/view-next.gif";
import continueLater from "@/assets/evaluation_tutorial/continue_later.gif";


interface TutorialPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    image: exerciseDetails.src,
    description: "1. Read the Exercise Detail"
  },
  {
    image: readSubmission.src,
    description: "2. Read the Submission and the corresponding feedback"
  },
  {
    image: evaluateMetrics.src,
    description: "3. Evaluate the feedback based on the metrics"
  },
  {
    image: metricsExplanation.src,
    description: "4. If unsure what a metrics mean, press the Info Icon or look at the 📊 Metrics Details"
  },
  {
    image: viewNext.src,
    description: "5. After evaluating all metrics for all feedbacks, click on Next ➡️ button to view the next submission."
  },
  {
    image: continueLater.src,
    description: "6. When you are ready to take a break, click on the 😴 Continue Later button."
  },
];

const TutorialPopup: React.FC<TutorialPopupProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Handlers for navigating between steps
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get the current tutorial step data
  const { image, description } = tutorialSteps[currentStep];

  return (
    <Popup isOpen={isOpen} onClose={onClose} title="Evaluation Tutorial">
      <div className="text-center">
        {/* Display the current GIF */}
        <img src={image} alt={`Tutorial Step ${currentStep + 1}`} className="w-full h-auto mb-4" />

        {/* Display the current description */}
        <p className="text-lg mb-4">{description}</p>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded disabled:opacity-50"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <span className="text-lg">{`${currentStep + 1} / ${tutorialSteps.length}`}</span>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleNext}
            disabled={currentStep === tutorialSteps.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default TutorialPopup;
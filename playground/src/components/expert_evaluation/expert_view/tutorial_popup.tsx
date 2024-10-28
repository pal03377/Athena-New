// src/components/ExerciseDetailPopup.tsx
import React from 'react';
import Popup from "@/components/expert_evaluation/expert_view/popup";
import tutorialPhoto from "@/assets/tutorial.gif";

interface TutorialPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialPopup: React.FC<TutorialPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose}
                               title="Evaluation Tutorial">
                            <img src={tutorialPhoto.src} alt="Tutorial Step 1" className="w-full h-auto"/>
                        </Popup>
  );
};

export default TutorialPopup;

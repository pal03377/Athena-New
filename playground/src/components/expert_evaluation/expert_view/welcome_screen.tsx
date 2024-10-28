import React, {useState} from 'react';
import TutorialPopup from "@/components/expert_evaluation/expert_view/tutorial_popup";
import background_image from "@/assets/start1.webp";

interface WelcomeScreenProps {
    onClose: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({onClose}) => {
    const [isTutorialOpen, setTutorialOpen] = useState(false);

    const closeTutorial = () => {
        setTutorialOpen(false);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
             style={{
                 backgroundImage: `url(${background_image.src})`, // Use the same path as in tailwind.config.js
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}>
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to the Expert Evaluation!</h1>
                <p className="text-lg mb-6">
                    Thank you for taking the time to participate. Your input is valuable to us, and we appreciate your
                    effort.
                </p>
                <button
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600"
                    onClick={() => setTutorialOpen(true)}
                >
                    📚 Start Tutorial
                </button>
            </div>
            <TutorialPopup isOpen={isTutorialOpen}
                           onClose={closeTutorial}/>
        </div>
    );
};

export default WelcomeScreen;
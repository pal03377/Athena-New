import React from 'react';
import background_image from "@/assets/evaluation_backgrounds/save-progress.webp";


interface ContinueLaterScreenProps {
    onClose: () => void;
}

const ContinueLaterScreen: React.FC<ContinueLaterScreenProps> = ({
                                                                     onClose,
                                                                 }) => {

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
             style={{
                 backgroundImage: `url(${background_image.src})`, // Use the same path as in tailwind.config.js
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}
        >
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
                <h1 className="text-4xl font-bold mb-4">Continue Later</h1>
                <p className="text-lg mb-6">
                    Your progress has been saved. You can continue the evaluation later using the same link.
                </p>
                <button
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 ml-4"
                    onClick={onClose}
                >
                    Continue Evaluation
                </button>
            </div>
        </div>
    );
};

export default ContinueLaterScreen;
import React from 'react';

interface WelcomeScreenProps {
    onClose: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to the Expert Evaluation!</h1>
                <p className="text-lg mb-6">
                    Thank you for taking the time to participate. Your input is valuable to us, and we appreciate your effort.
                </p>
                <button
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600"
                    onClick={onClose} //TODO add open tutorial
                >
                    Start Tutorial
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;
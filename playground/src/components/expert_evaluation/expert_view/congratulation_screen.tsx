import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface CongratulationScreenProps {
    onRestart: () => void;
}

const CongratulationScreen: React.FC<CongratulationScreenProps> = ({ onRestart }) => {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Listen for window resize events and update the state
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            {/* Confetti effect */}
            <Confetti
                width={windowSize.width}
                height={windowSize.height}
                numberOfPieces={300}
                gravity={0.2}
            />

            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full text-center relative z-10">
                <h1 className="text-4xl font-bold mb-4">Congratulations!</h1>
                <p className="text-lg mb-6">
                    You have successfully completed the expert evaluation. Thank you for your hard work!
                </p>
                <button
                    className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600"
                    onClick={onRestart}
                >
                    Restart Evaluation
                </button>
            </div>
        </div>
    );
};

export default CongratulationScreen;

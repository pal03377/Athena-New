import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import background_image from "@/assets/evaluation_backgrounds/congratulations1.webp";


interface CongratulationScreenProps {
    onRestart: () => void;
}

const CongratulationScreen: React.FC<CongratulationScreenProps> = ({ onRestart }) => {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    //TODO remove button below

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="fixed inset-0 bg-congratulation-bg bg-cover bg-center bg-black bg-opacity-75 flex items-center justify-center z-50"
        style={{
      backgroundImage: `url(${background_image.src})`, // Use the same path as in tailwind.config.js
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
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
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default CongratulationScreen;

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
import Popup from "@/components/expert_evaluation/expert_view/popup";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface SingleChoiceLikertScaleProps {
    title: string;
    summary: string;
    description: string;
    passedValue: number | null;
    onLikertChange: (value: number) => void;
    resetState: boolean;
}

const SingleChoiceLikertScale: React.FC<SingleChoiceLikertScaleProps> = ({
    title,
    summary,
    description,
    passedValue,
    onLikertChange,
    resetState,
}) => {
    const [selectedValue, setSelectedValue] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleInfoClick = () => {
        setIsPopupOpen(true);
    };

    useEffect(() => {
        setSelectedValue(passedValue);
    }, [resetState]);

    const handleChange = (value: number) => {
        setSelectedValue(value);
        onLikertChange(value);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
    };

    // Define color classes for the bottom border (red to green, grey for "not applicable")
    const borderColors = [
        'border-gray-500',   // Not Applicable
        'border-red-600',    // Strongly Disagree
        'border-orange-500', // Disagree
        'border-yellow-400', // Neutral
        'border-green-400',  // Agree
        'border-green-700',  // Strongly Agree
    ];

    // Define much brighter background colors for the selected state
    const selectedBgColors = [
        'bg-gray-200',   // Brighter Not Applicable
        'bg-red-200',    // Brighter Strongly Disagree
        'bg-orange-200', // Brighter Disagree
        'bg-yellow-200', // Brighter Neutral
        'bg-green-200',  // Brighter Agree
        'bg-green-300',  // Brighter Strongly Agree
    ];

    // Define labels corresponding to each value
    const scaleLabels = [
        'Not Ratable',
        'Strongly Disagree',
        'Disagree',
        'Neutral',
        'Agree',
        'Strongly Agree',
    ];

    return (
        <>
            {/* Title and Info Section */}
            <div className="flex items-center">
                <h3 className="text-sm font-semibold mr-1">{title}</h3>
                <span
                    onClick={handleInfoClick}
                    className="text-gray-400 cursor-pointer hover:text-gray-600"
                    role="img"
                    aria-label="info"
                >
                    <FontAwesomeIcon icon={faCircleInfo} />
                </span>
            </div>
            <Popup isOpen={isPopupOpen} onClose={closePopup} title="Information">
                <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose prose-sm max-w-none">
                    {description}
                </ReactMarkdown>
            </Popup>

            {/* Summary */}
            <p className="text-gray-700 text-xs mb-0.5">{summary}</p>

            {/* Single Choice Likert Scale */}
            <div className="flex justify-between w-full">
                {scaleLabels.map((label, index) => (
                    <button
                        key={index}
                        onClick={() => handleChange(index)}
                        className={`flex-1 text-xs py-0.5 text-center transition-colors duration-200 ease-in-out
                            ${selectedValue === index ? selectedBgColors[index] : 'bg-white'} 
                            ${selectedValue === index ? `${borderColors[index]} border-l border-t border-r` : 'border-gray-300 border-l border-t border-r'}
                            border-b-4 ${borderColors[index]}
                            ${index === 0 ? 'rounded-l-md' : ''} ${index === scaleLabels.length - 1 ? 'rounded-r-md' : ''}`}
                    >
                        <span className={`block font-normal ${selectedValue === index ? 'underline' : ''}`}>
                            {label}
                        </span>
                    </button>
                ))}
            </div>
        </>
    );
};
//TODO ldv mark that values are missing

export default SingleChoiceLikertScale;
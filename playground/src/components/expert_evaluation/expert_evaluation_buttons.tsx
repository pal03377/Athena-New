import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleInfo} from '@fortawesome/free-solid-svg-icons';

// Base button styles
const buttonBase = "px-4 py-2 rounded focus:outline-none transition-all";
const buttonPrimary = `${buttonBase} bg-blue-500 text-white hover:bg-blue-600`;
const buttonSecondary = `${buttonBase} bg-gray-300 text-gray-700 hover:bg-gray-400`;
const buttonFinish = `${buttonBase} bg-green-600 text-white hover:bg-green-700`;


interface NextButtonProps {
    onClick?: () => void;
    isFinish?: boolean;
    isInline?: boolean;
    className?: string;
}

export const NextButton: React.FC<NextButtonProps> = ({
                                                          onClick,
                                                          isFinish = false,
                                                          isInline = false,
                                                          className = '',
                                                      }) => (
    <button
        onClick={onClick}
        className={`${isFinish ? buttonFinish : buttonPrimary}  ${isInline ? 'inline-block' : 'w-full'} ${className}`}
    >
        {isFinish ? 'Finish 🏁' : 'Next ➡️'}
    </button>
);


interface SecondaryButtonProps {
    onClick?: () => void;
    isInline?: boolean;
    className?: string;
    text: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
                                                                    onClick,
                                                                    isInline = false,
                                                                    className = '',
                                                                    text,
                                                                }) => (
    <button
        onClick={onClick} // Will only trigger if `onClick` is provided
        className={`${buttonSecondary} ${isInline ? 'inline-block' : ''} ${className}`}
    >
        {text}
    </button>
);

interface PrimaryButtonProps {
    onClick?: () => void;
    isInline?: boolean;
    isDisabled?: boolean,
    className?: string;
    text: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
                                                                onClick,
                                                                isInline = false,
                                                                isDisabled = false,
                                                                className = '',
                                                                text,
                                                            }) => (
    <button
        onClick={onClick} // Will only trigger if `onClick` is provided
        className={`${buttonPrimary} ${isInline ? 'inline-block' : ''} ${className}`}
        disabled={isDisabled}
    >
        {text}
    </button>
);


export const InfoIconButton: React.FC<{ onClick?: () => void; className?: string }> = ({
                                                                                           onClick,
                                                                                           className = '',
                                                                                       }) => (
    <span
        onClick={onClick}
        className={`text-gray-400 cursor-pointer hover:text-gray-600 ${className}`}
        role="img"
        aria-label="info"
    >
    <FontAwesomeIcon icon={faCircleInfo}/>
  </span>
);

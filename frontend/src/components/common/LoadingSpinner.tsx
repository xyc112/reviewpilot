import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'medium', 
    text,
    fullScreen = false 
}) => {
    const sizeClass = `spinner-${size}`;
    const containerClass = fullScreen ? 'spinner-fullscreen' : 'spinner-container';

    return (
        <div className={containerClass}>
            <div className={`spinner ${sizeClass}`} role="status" aria-label={text || "加载中"}>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;


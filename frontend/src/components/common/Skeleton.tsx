import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
    type?: 'card' | 'text' | 'avatar' | 'button' | 'title';
    count?: number;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ type = 'text', count = 1, className = '' }) => {
    const skeletons = Array(count).fill(null);

    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`skeleton-card ${className}`}>
                        <div className="skeleton-card-header">
                            <div className="skeleton skeleton-title"></div>
                            <div className="skeleton skeleton-badge"></div>
                        </div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text skeleton-text-short"></div>
                        <div className="skeleton-tags">
                            <div className="skeleton skeleton-tag"></div>
                            <div className="skeleton skeleton-tag"></div>
                        </div>
                        <div className="skeleton-actions">
                            <div className="skeleton skeleton-button"></div>
                            <div className="skeleton-links">
                                <div className="skeleton skeleton-button-small"></div>
                                <div className="skeleton skeleton-button-small"></div>
                            </div>
                        </div>
                    </div>
                );
            case 'avatar':
                return <div className={`skeleton skeleton-avatar ${className}`}></div>;
            case 'button':
                return <div className={`skeleton skeleton-button ${className}`}></div>;
            case 'title':
                return <div className={`skeleton skeleton-title-large ${className}`}></div>;
            default:
                return <div className={`skeleton skeleton-text ${className}`}></div>;
        }
    };

    return (
        <>
            {skeletons.map((_, index) => (
                <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
            ))}
        </>
    );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="skeleton-grid">
            {Array(count).fill(null).map((_, index) => (
                <Skeleton key={index} type="card" />
            ))}
        </div>
    );
};

export default Skeleton;

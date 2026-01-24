import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = '1rem', className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        backgroundColor: '#e5e7eb',
        borderRadius: '0.25rem',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    />
  );
};

interface SkeletonGridProps {
  count?: number;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 3 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <Skeleton height="1.5rem" width="60%" />
          <Skeleton height="1rem" width="100%" style={{ marginTop: '0.5rem' }} />
          <Skeleton height="1rem" width="80%" style={{ marginTop: '0.5rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Skeleton height="2rem" width="5rem" />
            <Skeleton height="2rem" width="5rem" />
          </div>
        </div>
      ))}
    </div>
  );
};

export { Skeleton, SkeletonGrid };
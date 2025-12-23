import React from 'react';

interface SearchHighlightProps {
    text: string;
    searchQuery: string;
    className?: string;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, searchQuery, className = '' }) => {
    if (!searchQuery.trim()) {
        return <span className={className}>{text}</span>;
    }

    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    
    return (
        <span className={className}>
            {parts.map((part, index) => {
                const isMatch = part.toLowerCase() === searchQuery.toLowerCase();
                return isMatch ? (
                    <mark key={index} className="search-highlight">
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={index}>{part}</React.Fragment>
                );
            })}
        </span>
    );
};


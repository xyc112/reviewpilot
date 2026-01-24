import React from 'react';
import * as d3 from 'd3';
import { useTheme } from './ThemeProvider';

interface ProgressChartProps {
    completed: number;
    total: number;
    size?: number;
    strokeWidth?: number;
}

/**
 * 圆形进度图组件（使用 D3 和 SVG）
 */
export const CircularProgressChart: React.FC<ProgressChartProps> = ({
    completed,
    total,
    size = 120,
    strokeWidth = 12,
}) => {
    const { theme } = useTheme();
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    const isDark = theme === 'dark';

    // 根据百分比选择颜色
    const getColor = (percent: number) => {
        if (percent >= 80) return '#22c55e'; // green
        if (percent >= 60) return '#3b82f6'; // blue
        if (percent >= 40) return '#f59e0b'; // amber
        return '#ef4444'; // red
    };

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* 背景圆 */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={isDark ? '#374151' : '#f5f5f4'}
                    strokeWidth={strokeWidth}
                />
                {/* 进度圆 */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor(percentage)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
                    }}
                />
            </svg>
            {/* 中心文字 */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: isDark ? '#f9fafb' : '#1c1917' }}>
                    {Math.round(percentage)}%
                </div>
                <div style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#78716c', marginTop: '0.25rem' }}>
                    {completed}/{total}
                </div>
            </div>
        </div>
    );
};

interface BarChartProps {
    data: Array<{ label: string; value: number; color: string }>;
    height?: number;
}

/**
 * 简单的柱状图组件
 */
export const SimpleBarChart: React.FC<BarChartProps> = ({ data, height = 200 }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height, padding: '1rem 0' }}>
            {data.map((item, index) => (
                <div
                    key={index}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: `${(item.value / maxValue) * (height - 60)}px`,
                            backgroundColor: item.color,
                            borderRadius: '0.25rem 0.25rem 0 0',
                            minHeight: item.value > 0 ? '4px' : '0',
                            transition: 'height 0.5s ease',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: '0.25rem',
                        }}
                    >
                        {item.value > 0 && (
                            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                                {item.value}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#78716c', textAlign: 'center' }}>
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
};

interface ScoreDistributionProps {
    scores: Array<{ score: number; count: number }>;
}

/**
 * 分数分布图（柱状图）
 */
export const ScoreDistributionChart: React.FC<ScoreDistributionProps> = ({ scores }) => {
    // 将分数分组：0-59, 60-69, 70-79, 80-89, 90-100
    const ranges = [
        { label: '0-59', min: 0, max: 59, color: '#ef4444' },
        { label: '60-69', min: 60, max: 69, color: '#f59e0b' },
        { label: '70-79', min: 70, max: 79, color: '#3b82f6' },
        { label: '80-89', min: 80, max: 89, color: '#22c55e' },
        { label: '90-100', min: 90, max: 100, color: '#10b981' },
    ];

    const distribution = ranges.map(range => ({
        label: range.label,
        value: scores.filter(s => s.score >= range.min && s.score <= range.max).length,
        color: range.color,
    }));

    return <SimpleBarChart data={distribution} height={150} />;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '../types';

interface CourseContextType {
    selectedCourse: Course | null;
    setSelectedCourse: (course: Course | null) => void;
    clearSelectedCourse: () => void;
}

const CourseContext = createContext<CourseContextType | null>(null);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedCourse, setSelectedCourseState] = useState<Course | null>(() => {
        // 从 localStorage 读取选中的课程
        const saved = localStorage.getItem('selectedCourse');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        // 保存到 localStorage
        if (selectedCourse) {
            localStorage.setItem('selectedCourse', JSON.stringify(selectedCourse));
        } else {
            localStorage.removeItem('selectedCourse');
        }
    }, [selectedCourse]);

    const setSelectedCourse = (course: Course | null) => {
        setSelectedCourseState(course);
    };

    const clearSelectedCourse = () => {
        setSelectedCourseState(null);
    };

    return (
        <CourseContext.Provider value={{ selectedCourse, setSelectedCourse, clearSelectedCourse }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourse must be used within a CourseProvider');
    }
    return context;
};


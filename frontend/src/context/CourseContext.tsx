import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, UserCourse } from '../types';
import { userCourseAPI, courseAPI } from '../services/api';

interface CourseContextType {
    selectedCourse: Course | null; // 保留向后兼容，用于导航到课程详情等
    setSelectedCourse: (course: Course | null) => void;
    clearSelectedCourse: () => void;
    currentStudyingCourse: Course | null;
    selectedCourses: Course[]; // 用户选择的所有课程
    selectedCourseIds: Set<number>; // 用户选择的课程ID集合（用于快速判断）
    refreshUserCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | null>(null);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedCourse, setSelectedCourseState] = useState<Course | null>(() => {
        // 从 localStorage 读取选中的课程（用于导航）
        const saved = localStorage.getItem('selectedCourse');
        return saved ? JSON.parse(saved) : null;
    });

    const [currentStudyingCourse, setCurrentStudyingCourseState] = useState<Course | null>(null);
    const [selectedCourses, setSelectedCoursesState] = useState<Course[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());

    // 从服务器获取用户选择的课程和当前学习的课程
    const refreshUserCourses = async () => {
        try {
            const [userCoursesRes, coursesRes] = await Promise.all([
                userCourseAPI.getUserCourses(),
                courseAPI.getCourses(),
            ]);
            
            const userCourses = userCoursesRes.data;
            const allCourses = coursesRes.data;
            const coursesMap = new Map(allCourses.map(c => [c.id, c]));
            
            // 构建选择的课程列表
            const selected: Course[] = [];
            const selectedIds = new Set<number>();
            let currentStudying: Course | null = null;
            
            userCourses.forEach(uc => {
                const course = coursesMap.get(uc.courseId);
                if (course) {
                    selected.push(course);
                    selectedIds.add(uc.courseId);
                    if (uc.isCurrentStudying) {
                        currentStudying = course;
                    }
                }
            });
            
            setSelectedCoursesState(selected);
            setSelectedCourseIds(selectedIds);
            setCurrentStudyingCourseState(currentStudying);
        } catch (err) {
            console.error('Failed to fetch user courses:', err);
        }
    };

    useEffect(() => {
        // 保存到 localStorage
        if (selectedCourse) {
            localStorage.setItem('selectedCourse', JSON.stringify(selectedCourse));
        } else {
            localStorage.removeItem('selectedCourse');
        }
    }, [selectedCourse]);

    useEffect(() => {
        // 初始化时获取用户课程
        refreshUserCourses();
    }, []);

    const setSelectedCourse = (course: Course | null) => {
        setSelectedCourseState(course);
    };

    const clearSelectedCourse = () => {
        setSelectedCourseState(null);
    };

    return (
        <CourseContext.Provider value={{ 
            selectedCourse, 
            setSelectedCourse, 
            clearSelectedCourse,
            currentStudyingCourse,
            selectedCourses,
            selectedCourseIds,
            refreshUserCourses,
        }}>
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


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CourseList: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await courseAPI.getCourses();
            setCourses(response.data);
        } catch (err: any) {
            setError('获取课程列表失败');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>加载中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="course-list">
            <div className="page-header">
                <h1>课程列表</h1>
                {isAdmin && (
                    <Link to="/courses/new" className="btn btn-primary">
                        创建新课程
                    </Link>
                )}
            </div>

            <div className="courses-grid">
                {courses.map((course) => (
                    <div key={course.id} className="course-card">
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        <div className="course-tags">
                            {course.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                        <div className="course-level">{course.level}</div>
                        <div className="course-actions">
                            <Link to={`/courses/${course.id}`} className="btn btn-secondary">
                                查看详情
                            </Link>
                            <Link to={`/courses/${course.id}/graph`} className="btn btn-outline">
                                知识图谱
                            </Link>
                            <Link to={`/courses/${course.id}/notes`} className="btn btn-outline">
                                笔记
                            </Link>
                            <Link to={`/courses/${course.id}/quizzes`} className="btn btn-outline">
                                测验
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseList;
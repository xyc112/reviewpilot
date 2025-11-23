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

// 在 CourseList.tsx 中添加这些样式（或者单独创建CSS文件）
const courseListStyles = `
.course-list {
    padding: 20px 0;
}

.courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
    margin-top: 30px;
}

.course-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    border: 1px solid #e2e8f0;
}

.course-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.course-card h3 {
    color: #2d3748;
    margin: 0 0 12px 0;
    font-size: 1.3rem;
    font-weight: 600;
}

.course-card p {
    color: #718096;
    line-height: 1.5;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.course-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}

.course-level {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 16px;
}

.course-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

/* 在现有的CSS中添加这些样式类 */
`;
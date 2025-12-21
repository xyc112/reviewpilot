import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Book, Network, FileText, ArrowRight, Plus } from 'lucide-react';
import '../styles/CourseUI.css';
import '../styles/Course.css';

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

    const getLevelText = (level: string) => {
        const levels: Record<string, string> = {
            'BEGINNER': '初级',
            'INTERMEDIATE': '中级',
            'ADVANCED': '高级'
        };
        return levels[level] || level;
    };

    const getLevelClass = (level: string) => {
        return `level-badge level-${level.toLowerCase()}`;
    };

    if (loading) return (
        <div className="container">
            <div className="loading">加载中...</div>
        </div>
    );

    if (error) return (
        <div className="container">
            <div className="error-message">{error}</div>
        </div>
    );

    return (
        <div className="container">
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>课程列表</h1>
                        <p className="text-stone-500 mt-2">探索并管理您的学习旅程</p>
                    </div>
                    {isAdmin && (
                        <Link to="/courses/new" className="btn btn-primary">
                            <Plus size={18} />
                            创建新课程
                        </Link>
                    )}
                </div>
            </div>

            {courses.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Book size={48} strokeWidth={1} />
                    </div>
                    <h3>暂无课程</h3>
                    <p>还没有创建任何课程，{isAdmin ? '立即创建第一个课程吧！' : '请等待管理员创建课程。'}</p>
                    {isAdmin && (
                        <Link to="/courses/new" className="btn btn-primary">
                            创建新课程
                        </Link>
                    )}
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => (
                        <div key={course.id} className="course-card">
                            <div className="course-card-header">
                                <h3 className="course-title">{course.title}</h3>
                                <span className={getLevelClass(course.level)}>
                                    {getLevelText(course.level)}
                                </span>
                            </div>
                            <p className="course-description">{course.description || '暂无描述'}</p>

                            {course.tags.length > 0 && (
                                <div className="course-tags">
                                    {course.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            )}

                            <div className="course-actions">
                                <Link to={`/courses/${course.id}`} className="btn btn-secondary">
                                    查看详情
                                    <ArrowRight size={16} />
                                </Link>
                                <div className="course-links">
                                    <Link to={`/courses/${course.id}/graph`} className="btn btn-outline btn-small" title="知识图谱">
                                        <Network size={16} />
                                    </Link>
                                    <Link to={`/courses/${course.id}/notes`} className="btn btn-outline btn-small" title="笔记">
                                        <FileText size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseList;
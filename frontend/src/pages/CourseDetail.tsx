// src/pages/CourseDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Course.css';

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchCourse(Number(id));
        }
    }, [id]);

    const fetchCourse = async (courseId: number) => {
        try {
            const response = await courseAPI.getCourse(courseId);
            setCourse(response.data);
        } catch (err: any) {
            setError('获取课程详情失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!course) return;

        if (!window.confirm('确定要删除这个课程吗？此操作不可撤销。')) {
            return;
        }

        try {
            await courseAPI.deleteCourse(course.id);
            navigate('/courses');
        } catch (err: any) {
            alert('删除课程失败: ' + (err.response?.data?.message || '无权限'));
        }
    };

    const getLevelText = (level: string) => {
        const levels = {
            'BEGINNER': '初级',
            'INTERMEDIATE': '中级',
            'ADVANCED': '高级'
        };
        return levels[level as keyof typeof levels] || level;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    if (!course) return (
        <div className="container">
            <div className="error-message">课程不存在</div>
        </div>
    );

    const canEdit = isAdmin || user?.id === course.authorId;

    return (
        <div className="container">
            <div className="course-detail">
                <div className="page-header">
                    <div className="header-content">
                        <h1>{course.title}</h1>
                        <div className="header-actions">
                            {canEdit && (
                                <>
                                    <Link
                                        to={`/courses/edit/${course.id}`}
                                        className="btn btn-primary"
                                    >
                                        编辑课程
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        className="btn btn-danger"
                                    >
                                        删除课程
                                    </button>
                                </>
                            )}
                            <Link to="/courses" className="btn btn-secondary">
                                返回列表
                            </Link>
                        </div>
                    </div>
                    <div className="course-meta">
                        <span className={`level-badge level-${course.level.toLowerCase()}`}>
                            {getLevelText(course.level)}
                        </span>
                        <span className="created-date">
                            创建于 {formatDate(course.createdAt)}
                        </span>
                    </div>
                </div>

                <div className="course-content">
                    <div className="content-section">
                        <h2>课程描述</h2>
                        <p className="description">{course.description || '暂无描述'}</p>
                    </div>

                    {course.tags.length > 0 && (
                        <div className="content-section">
                            <h2>课程标签</h2>
                            <div className="tags-container">
                                {course.tags.map(tag => (
                                    <span key={tag} className="tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="course-navigation">
                        <Link to={`/courses/${course.id}/graph`} className="nav-card">
                            <div className="nav-icon">📊</div>
                            <h3>知识图谱</h3>
                            <p>可视化课程知识点关系</p>
                        </Link>
                        <Link to={`/courses/${course.id}/notes`} className="nav-card">
                            <div className="nav-icon">📝</div>
                            <h3>课程笔记</h3>
                            <p>查看和创建学习笔记</p>
                        </Link>
                        <Link to={`/courses/${course.id}/quizzes`} className="nav-card">
                            <div className="nav-icon">🧩</div>
                            <h3>课程测验</h3>
                            <p>测试学习成果</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;

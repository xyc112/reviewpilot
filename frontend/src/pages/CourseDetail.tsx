import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Calendar, User, BarChart, ArrowLeft } from 'lucide-react';
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
            <div className="mb-6">
                <Link to="/courses" className="btn btn-outline btn-small inline-flex items-center gap-2">
                    <ArrowLeft size={16} />
                    返回课程列表
                </Link>
            </div>

            <div className="course-detail">
                <div className="course-content">
                    <div className="content-section">
                        <div className="header-content">
                            <h1>{course.title}</h1>
                            <div className="header-actions">
                                {canEdit && (
                                    <>
                                        <Link
                                            to={`/courses/edit/${course.id}`}
                                            className="btn btn-secondary"
                                        >
                                            <Edit size={16} />
                                            编辑课程
                                        </Link>
                                        <button
                                            onClick={handleDelete}
                                            className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                        >
                                            <Trash2 size={16} />
                                            删除课程
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="course-meta mb-6">
                            <div className="flex items-center gap-2">
                                <BarChart size={16} />
                                <span className={`level-badge level-${course.level.toLowerCase()}`}>
                                    {getLevelText(course.level)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{formatDate(course.createdAt)}</span>
                            </div>
                            {course.authorId && (
                                <div className="flex items-center gap-2">
                                    <User size={16} />
                                    <span>作者 ID: {course.authorId}</span>
                                </div>
                            )}
                        </div>

                        <div className="description mb-6">
                            <h3 className="text-lg font-semibold mb-2 text-stone-800">课程简介</h3>
                            <p>{course.description || '暂无描述'}</p>
                        </div>

                        {course.tags.length > 0 && (
                            <div className="tags-container">
                                {course.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
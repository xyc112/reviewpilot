import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Calendar, User, BarChart, ArrowLeft, MessageSquare } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import '../styles/Course.css';

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { success, error: showError } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);

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

    const handleDelete = () => {
        setDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!course) return;
        try {
            await courseAPI.deleteCourse(course.id);
            success('课程删除成功');
            navigate('/courses');
        } catch (err: any) {
            const errorMsg = '删除课程失败: ' + (err.response?.data?.message || '无权限');
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setDeleteConfirm(false);
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
            <ConfirmDialog
                isOpen={deleteConfirm}
                title="删除课程"
                message="确定要删除这个课程吗？此操作不可撤销，将删除课程及其所有相关内容（笔记、测验、知识图谱等）。"
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm(false)}
            />

            <div className="mb-6">
                <Link to="/courses" className="btn btn-outline btn-small inline-flex items-center gap-2">
                    <ArrowLeft size={16} />
                    返回课程列表
                </Link>
            </div>

            <div className="course-detail">
                <div className="course-content">
                    <div className="content-section">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
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

                        <div className="mt-6 pt-6 border-t border-stone-200">
                            <Link
                                to={`/courses/${course.id}/community`}
                                className="btn btn-primary inline-flex items-center gap-2"
                            >
                                <MessageSquare size={18} />
                                进入课程社区
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
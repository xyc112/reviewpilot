import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course } from '../types';
import { courseAPI, noteAPI, quizAPI, postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { Edit, Trash2, Calendar, User, BarChart, FileText, ClipboardList, MessageSquare, BookOpen } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import '../styles/Course.css';

const CourseOverview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, isAdmin } = useAuth();
    const { currentStudyingCourse } = useCourse();
    const { success, error: showError } = useToast();
    const [course, setCourse] = useState<Course | null>(null);
    const [stats, setStats] = useState<{
        noteCount: number;
        quizCount: number;
        postCount: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        if (id) {
            fetchCourseData(Number(id));
        }
    }, [id]);

    const fetchCourseData = async (courseId: number) => {
        try {
            setLoading(true);
            const courseRes = await courseAPI.getCourse(courseId);
            setCourse(courseRes.data);

            // 获取统计信息
            try {
                const [notesRes, quizzesRes, postsRes] = await Promise.all([
                    noteAPI.getNotes(courseId).catch(() => ({ data: [] })),
                    quizAPI.getQuizzes(courseId).catch(() => ({ data: [] })),
                    postAPI.getPosts(courseId).catch(() => ({ data: [] })),
                ]);

                setStats({
                    noteCount: notesRes.data.length,
                    quizCount: quizzesRes.data.length,
                    postCount: postsRes.data.length,
                });
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        } catch (err: any) {
            setError('获取课程信息失败');
            showError('获取课程信息失败: ' + (err.response?.data?.message || err.message));
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
            window.location.href = '/courses';
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
    const isCurrentCourse = currentStudyingCourse?.id === course.id;

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

            <div className="course-detail">
                <div className="course-content">
                    <div className="content-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            {isCurrentCourse && (
                                <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                                    <BookOpen size={14} />
                                    当前学习课程
                                </span>
                            )}
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
                            <div className="prose max-w-none">
                                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                                    {course.description || '暂无描述'}
                                </p>
                            </div>
                        </div>

                        {course.tags.length > 0 && (
                            <div className="tags-container mb-6">
                                {course.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* 统计信息卡片 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="card p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <FileText size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-stone-500">笔记数量</p>
                                        <p className="text-2xl font-bold text-stone-800">
                                            {stats?.noteCount ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="card p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <ClipboardList size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-stone-500">测验数量</p>
                                        <p className="text-2xl font-bold text-stone-800">
                                            {stats?.quizCount ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="card p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <MessageSquare size={24} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-stone-500">帖子数量</p>
                                        <p className="text-2xl font-bold text-stone-800">
                                            {stats?.postCount ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseOverview;


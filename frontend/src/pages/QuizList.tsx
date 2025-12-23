// src/pages/QuizList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Quiz } from '../types';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { Plus, ClipboardList, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import '../styles/Course.css';

const QuizList: React.FC = () => {
    const navigate = useNavigate();
    const { selectedCourse, currentStudyingCourse } = useCourse();
    const course = selectedCourse || currentStudyingCourse;
    const { isAdmin } = useAuth();
    const { success, error: showError } = useToast();

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; quizId: string | null }>({
        isOpen: false,
        quizId: null,
    });

    useEffect(() => {
        if (!course) {
            navigate('/courses');
            return;
        }
        fetchQuizzes();
    }, [course, navigate]);

    const fetchQuizzes = async () => {
        if (!course) return;
        try {
            const response = await quizAPI.getQuizzes(course.id);
            setQuizzes(response.data);
        } catch (err: any) {
            setError('获取测验列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (quizId: string) => {
        setDeleteConfirm({ isOpen: true, quizId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.quizId) return;
        if (!course) return;
        try {
            await quizAPI.deleteQuiz(course.id, deleteConfirm.quizId);
            success('测验删除成功');
            fetchQuizzes();
        } catch (err: any) {
            const errorMsg = '删除测验失败: ' + (err.response?.data?.message || '未知错误');
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setDeleteConfirm({ isOpen: false, quizId: null });
        }
    };

    if (!course) {
        return (
            <div className="container">
                <div className="error-message">请先选择一个课程</div>
                <button onClick={() => navigate('/courses')} className="btn btn-primary">
                    前往课程列表
                </button>
            </div>
        );
    }

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="notes-view">
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>课程测验</h1>
                        <p className="text-stone-500 mt-2">{course?.title} - 测试您的学习成果</p>
                    </div>
                    {course && (
                        <div className="header-actions">
                            {isAdmin && (
                                <Link
                                    to="/quizzes/new"
                                    className="btn btn-primary"
                                >
                                    <Plus size={18} />
                                    创建测验
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="error-message mb-4">{error}</div>}

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="删除测验"
                message="确定要删除这个测验吗？此操作无法撤销，将删除测验及其所有相关数据。"
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, quizId: null })}
            />

            <div className="notes-container">
                {quizzes.length === 0 ? (
                    <div className="empty-state">
                        <ClipboardList size={48} className="text-stone-400 mb-4" />
                        <p className="text-lg font-semibold mb-2">暂无测验</p>
                        <p className="text-stone-500 mb-4">
                            {isAdmin ? '立即创建第一个测验吧！' : '请等待管理员创建测验。'}
                        </p>
                        {isAdmin && course && (
                            <Link to="/quizzes/new" className="btn btn-primary">
                                <Plus size={18} />
                                创建新测验
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="notes-grid">
                        {quizzes.map((quiz) => (
                            <div key={quiz.id} className="note-card">
                                <div className="note-card-header">
                                    <h3>{quiz.title}</h3>
                                    <span className="visibility-badge public">
                                        {quiz.questions.length} 题
                                    </span>
                                </div>
                                <div className="note-card-content">
                                    <p className="text-stone-600">
                                        包含 {quiz.questions.length} 道题目，测试您对课程知识的掌握程度
                                    </p>
                                </div>
                                <div className="note-card-footer">
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/quizzes/${quiz.id}`}
                                            className="btn btn-primary btn-small"
                                        >
                                            开始测验
                                        </Link>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/quizzes/edit/${quiz.id}`)}
                                                    className="btn btn-outline btn-small"
                                                    title="编辑测验"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(quiz.id)}
                                                    className="btn btn-outline btn-small text-red-600"
                                                    title="删除测验"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizList;
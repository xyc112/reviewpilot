// src/pages/QuizList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Quiz } from '../types';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/Toast';
import '../styles/Course.css';

const QuizList: React.FC = () => {
    const navigate = useNavigate();
    const { selectedCourse } = useCourse();
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
        if (!selectedCourse) {
            navigate('/courses');
            return;
        }
        fetchQuizzes();
    }, [selectedCourse, navigate]);

    const fetchQuizzes = async () => {
        if (!selectedCourse) return;
        try {
            const response = await quizAPI.getQuizzes(selectedCourse.id);
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
        if (!selectedCourse) return;
        try {
            await quizAPI.deleteQuiz(selectedCourse.id, deleteConfirm.quizId);
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

    if (!selectedCourse) {
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
        <div className="container">
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>课程测验</h1>
                        <p className="text-stone-500 mt-2">{selectedCourse?.title} - 课程测验</p>
                    </div>
                    {isAdmin && selectedCourse && (
                        <div className="header-actions">
                            <Link to="/quizzes/new" className="btn btn-primary">
                                + 创建测验
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="删除测验"
                message="确定要删除这个测验吗？此操作无法撤销。"
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, quizId: null })}
            />

            {quizzes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🧩</div>
                    <h3>暂无测验</h3>
                    <p>还没有创建任何测验，{isAdmin ? '立即创建第一个测验吧！' : '请等待管理员创建测验。'}</p>
                    {isAdmin && selectedCourse && (
                        <Link to="/quizzes/new" className="btn btn-primary">
                            创建新测验
                        </Link>
                    )}
                </div>
            ) : (
                <div className="quizzes-grid">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="quiz-card">
                            <h3>{quiz.title}</h3>
                            <p>题目数量: {quiz.questions.length}</p>
                            <div className="quiz-actions">
                                <Link
                                    to={`/quizzes/${quiz.id}`}
                                    className="btn btn-secondary"
                                >
                                    开始测验
                                </Link>
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => navigate(`/quizzes/edit/${quiz.id}`)}
                                            className="btn btn-outline"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quiz.id)}
                                            className="btn btn-danger"
                                        >
                                            删除
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizList;
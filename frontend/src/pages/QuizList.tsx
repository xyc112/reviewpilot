// src/pages/QuizList.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Quiz } from '../types';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Course.css';

const QuizList: React.FC = () => {
    const { id: courseId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (courseId) {
            fetchQuizzes(Number(courseId));
        }
    }, [courseId]);

    const fetchQuizzes = async (courseId: number) => {
        try {
            const response = await quizAPI.getQuizzes(courseId);
            setQuizzes(response.data);
        } catch (err: any) {
            setError('获取测验列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (quizId: string) => {
        if (!window.confirm('确定要删除这个测验吗？')) return;

        try {
            await quizAPI.deleteQuiz(Number(courseId), quizId);
            fetchQuizzes(Number(courseId));
        } catch (err: any) {
            alert('删除测验失败: ' + (err.response?.data?.message || '未知错误'));
        }
    };

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1>课程测验</h1>
                {isAdmin && (
                    <Link to={`/courses/${courseId}/quizzes/new`} className="btn btn-primary">
                        + 创建测验
                    </Link>
                )}
            </div>

            {quizzes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🧩</div>
                    <h3>暂无测验</h3>
                    <p>还没有创建任何测验，{isAdmin ? '立即创建第一个测验吧！' : '请等待管理员创建测验。'}</p>
                    {isAdmin && (
                        <Link to={`/courses/${courseId}/quizzes/new`} className="btn btn-primary">
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
                                    to={`/courses/${courseId}/quizzes/${quiz.id}`}
                                    className="btn btn-secondary"
                                >
                                    开始测验
                                </Link>
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => navigate(`/courses/${courseId}/quizzes/edit/${quiz.id}`)}
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
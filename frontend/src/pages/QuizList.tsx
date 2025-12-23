// src/pages/QuizList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Quiz } from '../types';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { Plus, ClipboardList, Edit, Trash2, Search, X } from 'lucide-react';
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
    const [searchQuery, setSearchQuery] = useState('');
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

    // 过滤测验
    const filteredQuizzes = useMemo(() => {
        return quizzes.filter(quiz => {
            // 搜索过滤
            const matchesSearch = !searchQuery || 
                quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [quizzes, searchQuery]);

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
            {course && isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <Link
                        to="/quizzes/new"
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        创建测验
                    </Link>
                </div>
            )}

            {error && <div className="error-message mb-4">{error}</div>}

            {/* 搜索栏 */}
            <div className="search-filter-bar" style={{ marginBottom: '1.5rem' }}>
                <div className="search-box">
                    <div className="input-icon-wrapper">
                        <Search size={20} className="input-icon" />
                        <div className="input-icon-divider"></div>
                    </div>
                    <input
                        type="text"
                        placeholder="搜索测验标题..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="search-clear"
                            aria-label="清除搜索"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <span className="search-shortcut-hint" title="快捷键">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    </span>
                </div>
            </div>

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
                ) : filteredQuizzes.length === 0 && searchQuery ? (
                    <div className="empty-state">
                        <ClipboardList size={48} className="text-stone-400 mb-4" />
                        <p className="text-lg font-semibold mb-2">未找到匹配的测验</p>
                        <p className="text-stone-500 mb-4">尝试调整搜索条件</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="btn btn-primary"
                        >
                            清除搜索
                        </button>
                    </div>
                ) : (
                    <div className="quizzes-list">
                        {filteredQuizzes.map((quiz) => (
                            <div key={quiz.id} className="quiz-list-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#1c1917' }}>
                                                {quiz.title}
                                            </h3>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: '#dbeafe',
                                                color: '#1e40af',
                                            }}>
                                                {quiz.questions.length} 题
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#78716c' }}>
                                            包含 {quiz.questions.length} 道题目，测试您对课程知识的掌握程度
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                    <Link
                                        to={`/quizzes/${quiz.id}`}
                                        className="btn btn-primary"
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
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="btn btn-danger btn-small"
                                                title="删除测验"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
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
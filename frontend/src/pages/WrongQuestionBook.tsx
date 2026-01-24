import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WrongQuestion, Question } from '../types';
import { wrongQuestionAPI, quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { useTheme } from '../components/ThemeProvider';
import { BookOpen, X, CheckCircle, RotateCcw, Trash2, ArrowLeft, Search } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import '../styles/Course.css';

const WrongQuestionBook: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentStudyingCourse, selectedCourse } = useCourse();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { success, error: showError } = useToast();
    
    const course = currentStudyingCourse || selectedCourse;
    const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'notMastered' | 'mastered'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [practicingQuestion, setPracticingQuestion] = useState<WrongQuestion | null>(null);
    const [practiceAnswers, setPracticeAnswers] = useState<Record<number, number[]>>({});
    const [showPracticeResult, setShowPracticeResult] = useState<Record<number, boolean>>({});
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [stats, setStats] = useState<{ total: number; mastered: number; notMastered: number } | null>(null);

    useEffect(() => {
        if (!course) {
            navigate('/courses');
            return;
        }
        fetchWrongQuestions();
        fetchStats();
    }, [course, navigate, filter]);

    // 当错题列表更新时，重新获取统计信息
    useEffect(() => {
        if (course && !loading) {
            // 延迟一下，确保数据已更新
            const timer = setTimeout(() => {
                fetchStats();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [wrongQuestions.length, course, loading]);

    const fetchWrongQuestions = async () => {
        if (!course) return;
        try {
            setLoading(true);
            const mastered = filter === 'all' ? undefined : filter === 'mastered';
            const response = await wrongQuestionAPI.getWrongQuestions(course.id, mastered);
            setWrongQuestions(response.data);
        } catch (err: any) {
            setError('获取错题列表失败: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!course) return;
        try {
            const response = await wrongQuestionAPI.getStats(course.id);
            setStats({
                total: response.data.total || 0,
                mastered: response.data.mastered || 0,
                notMastered: response.data.notMastered || 0
            });
        } catch (err: any) {
            console.error('Failed to fetch stats:', err);
            setStats({ total: 0, mastered: 0, notMastered: 0 });
        }
    };

    const handleMarkAsMastered = async (wrongQuestionId: number) => {
        if (!course) return;
        try {
            await wrongQuestionAPI.markAsMastered(course.id, wrongQuestionId);
            success('已标记为已掌握');
            fetchWrongQuestions();
            fetchStats();
        } catch (err: any) {
            showError('标记失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleRemove = async () => {
        if (!deleteConfirm || !course) return;
        try {
            await wrongQuestionAPI.removeWrongQuestion(course.id, deleteConfirm);
            success('已从错题本移除');
            setDeleteConfirm(null);
            fetchWrongQuestions();
            fetchStats();
        } catch (err: any) {
            showError('移除失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleStartPractice = (wrongQuestion: WrongQuestion) => {
        setPracticingQuestion(wrongQuestion);
        setPracticeAnswers({});
        setShowPracticeResult({});
    };

    const handlePracticeOptionSelect = (questionId: number, optionIndex: number, questionType: string) => {
        setPracticeAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            if (questionType === 'single' || questionType === 'truefalse') {
                return { ...prev, [questionId]: [optionIndex] };
            } else {
                let newAnswers;
                if (currentAnswers.includes(optionIndex)) {
                    newAnswers = currentAnswers.filter(idx => idx !== optionIndex);
                } else {
                    newAnswers = [...currentAnswers, optionIndex].sort((a, b) => a - b);
                }
                return { ...prev, [questionId]: newAnswers };
            }
        });
    };

    const handleSubmitPractice = async () => {
        if (!practicingQuestion || !course) return;
        try {
            // 增加练习次数
            await wrongQuestionAPI.practiceWrongQuestion(course.id, practicingQuestion.id);
            
            // 检查答案是否正确
            const userAnswer = practiceAnswers[practicingQuestion.questionId] || [];
            const correctAnswer = practicingQuestion.question?.answer || [];
            const isCorrect = JSON.stringify([...userAnswer].sort()) === JSON.stringify([...correctAnswer].sort());
            
            setShowPracticeResult({ [practicingQuestion.questionId]: true });
            
            if (isCorrect) {
                success('回答正确！');
            } else {
                showError('回答错误，请继续练习');
            }
            
            fetchWrongQuestions();
        } catch (err: any) {
            showError('提交失败: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleClosePractice = () => {
        setPracticingQuestion(null);
        setPracticeAnswers({});
        setShowPracticeResult({});
    };

    // 过滤错题
    const filteredWrongQuestions = useMemo(() => {
        return wrongQuestions.filter(wq => {
            // 搜索过滤
            const matchesSearch = !searchQuery || 
                (wq.question?.question && wq.question.question.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesSearch;
        });
    }, [wrongQuestions, searchQuery]);

    if (!course) {
        return (
            <div className="container">
                <div className="error-message">请先选择一个课程</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container">
                <div className="loading">加载中...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                title="移除错题"
                message="确定要从错题本中移除这道题吗？"
                confirmText="移除"
                cancelText="取消"
                type="danger"
                onConfirm={handleRemove}
                onCancel={() => setDeleteConfirm(null)}
            />


            {stats && (
                <div className="stats-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="card">
                        <div className="text-sm mb-1" style={{ color: isDark ? '#9ca3af' : '#78716c' }}>总错题数</div>
                        <div className="text-2xl font-bold" style={{ color: isDark ? '#f9fafb' : '#1c1917' }}>{stats.total}</div>
                    </div>
                    <div className="card">
                        <div className="text-sm mb-1" style={{ color: isDark ? '#9ca3af' : '#78716c' }}>未掌握</div>
                        <div className="text-2xl font-bold text-red-600">{stats.notMastered}</div>
                    </div>
                    <div className="card">
                        <div className="text-sm mb-1" style={{ color: isDark ? '#9ca3af' : '#78716c' }}>已掌握</div>
                        <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
                    </div>
                </div>
            )}

            <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
                <button
                    onClick={() => setFilter('all')}
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                >
                    全部
                </button>
                <button
                    onClick={() => setFilter('notMastered')}
                    className={`btn ${filter === 'notMastered' ? 'btn-primary' : 'btn-outline'}`}
                >
                    未掌握
                </button>
                <button
                    onClick={() => setFilter('mastered')}
                    className={`btn ${filter === 'mastered' ? 'btn-primary' : 'btn-outline'}`}
                >
                    已掌握
                </button>
            </div>

            {/* 搜索栏 */}
            <div className="search-filter-bar" style={{ marginBottom: '2rem' }}>
                <div className="search-box">
                    <div className="input-icon-wrapper">
                        <Search size={20} className="input-icon" />
                        <div className="input-icon-divider"></div>
                    </div>
                    <input
                        type="text"
                        placeholder="搜索错题内容..."
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

            {error && <div className="error-message mb-4">{error}</div>}

            {practicingQuestion && practicingQuestion.question && (
                <div className="practice-modal card" style={{ marginBottom: '2rem' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: isDark ? '#f9fafb' : '#1c1917' }}>练习错题</h3>
                        <button onClick={handleClosePractice} className="btn-icon">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="question-practice">
                        <div className="question-text mb-4">
                            {practicingQuestion.question.question}
                            {practicingQuestion.question.type === 'multiple' && (
                                <span className="question-type-badge">[多选]</span>
                            )}
                            {practicingQuestion.question.type === 'truefalse' && (
                                <span className="question-type-badge">[判断]</span>
                            )}
                        </div>

                        <div className="options-practice mb-4">
                            {practicingQuestion.question.options?.map((option, optIndex) => {
                                const isSelected = (practiceAnswers[practicingQuestion.questionId] || []).includes(optIndex);
                                const showResult = showPracticeResult[practicingQuestion.questionId];
                                const isCorrect = practicingQuestion.question?.answer?.includes(optIndex);
                                const isCorrectlySelected = isSelected && isCorrect;
                                const isIncorrectlySelected = isSelected && !isCorrect;
                                
                                return (
                                    <div
                                        key={optIndex}
                                        className={`option-item ${isSelected ? 'selected' : ''} ${showResult && isCorrectlySelected ? 'correct' : ''} ${showResult && isIncorrectlySelected ? 'incorrect' : ''} ${showResult && !isSelected && isCorrect ? 'correct' : ''}`}
                                        style={{ cursor: showResult ? 'default' : 'pointer' }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!showResult) {
                                                handlePracticeOptionSelect(
                                                    practicingQuestion.questionId,
                                                    optIndex,
                                                    practicingQuestion.question.type
                                                );
                                            }
                                        }}
                                    >
                                        <span className="option-label" style={{ fontWeight: 600, minWidth: '1.5rem' }}>
                                            {String.fromCharCode(65 + optIndex)}.
                                        </span>
                                        <span className="option-text" style={{ flex: 1 }}>{option}</span>
                                        {showResult && isCorrect && (
                                            <span style={{ color: '#10b981', fontWeight: 700, marginLeft: '0.5rem' }}>✓</span>
                                        )}
                                        {showResult && isIncorrectlySelected && (
                                            <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: '0.5rem' }}>✗</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {showPracticeResult[practicingQuestion.questionId] && (
                            <div className="practice-result mb-4">
                                <div className="text-sm mb-2" style={{ color: isDark ? '#d1d5db' : '#57534e' }}>正确答案：</div>
                                <div className="correct-answers" style={{ color: isDark ? '#f9fafb' : '#1c1917' }}>
                                    {practicingQuestion.question.answer?.map(idx => 
                                        String.fromCharCode(65 + idx)
                                    ).join(', ')}
                                </div>
                                {practicingQuestion.question.explanation && (
                                    <div className="explanation mt-4">
                                        <div className="text-sm font-semibold mb-2" style={{ color: isDark ? '#f9fafb' : '#1c1917' }}>解析：</div>
                                        <div className="text-sm" style={{ color: isDark ? '#d1d5db' : '#57534e' }}>{practicingQuestion.question.explanation}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="form-actions">
                            {!showPracticeResult[practicingQuestion.questionId] ? (
                                <button onClick={handleSubmitPractice} className="btn btn-primary">
                                    提交答案
                                </button>
                            ) : (
                                <button onClick={handleClosePractice} className="btn btn-outline">
                                    关闭
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="wrong-questions-list">
                {!loading && wrongQuestions.length === 0 ? (
                    <div className="empty-state">
                        <BookOpen size={48} style={{ color: isDark ? '#6b7280' : '#a8a29e', marginBottom: '1rem' }} />
                        <p className="text-lg font-semibold mb-2" style={{ color: isDark ? '#f9fafb' : '#1c1917' }}>暂无错题</p>
                        <p style={{ color: isDark ? '#9ca3af' : '#78716c' }}>
                            {filter === 'mastered' 
                                ? '暂无已掌握的错题' 
                                : filter === 'notMastered' 
                                ? '暂无未掌握的错题' 
                                : '完成测验后，错题会自动添加到错题本'}
                        </p>
                    </div>
                ) : filteredWrongQuestions.length === 0 && searchQuery ? (
                    <div className="empty-state">
                        <BookOpen size={48} style={{ color: isDark ? '#6b7280' : '#a8a29e', marginBottom: '1rem' }} />
                        <p className="text-lg font-semibold mb-2" style={{ color: isDark ? '#f9fafb' : '#1c1917' }}>未找到匹配的错题</p>
                        <p style={{ color: isDark ? '#9ca3af' : '#78716c', marginBottom: '1rem' }}>尝试调整搜索条件</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="btn btn-primary"
                        >
                            清除搜索
                        </button>
                    </div>
                ) : filteredWrongQuestions.length > 0 ? (
                    filteredWrongQuestions.map(wq => (
                        <div key={wq.id} className="wrong-question-card card mb-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <div className="question-text mb-2">
                                        {wq.question?.question || '题目加载中...'}
                                    </div>
                                    <div className="wrong-question-meta text-sm" style={{ color: isDark ? '#9ca3af' : '#78716c' }}>
                                        <span>来自测验: {wq.quizId}</span>
                                        <span className="ml-4">练习次数: {wq.practiceCount}</span>
                                        <span className="ml-4">添加时间: {new Date(wq.addedAt).toLocaleDateString('zh-CN')}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {wq.mastered ? (
                                        <span className="badge badge-success">已掌握</span>
                                    ) : (
                                        <span className="badge badge-warning">未掌握</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="wrong-question-actions flex gap-2">
                                <button
                                    onClick={() => handleStartPractice(wq)}
                                    className="btn btn-primary btn-small"
                                >
                                    <RotateCcw size={14} />
                                    重新练习
                                </button>
                                {!wq.mastered && (
                                    <button
                                        onClick={() => handleMarkAsMastered(wq.id)}
                                        className="btn btn-outline btn-small"
                                    >
                                        <CheckCircle size={14} />
                                        标记为已掌握
                                    </button>
                                )}
                                <button
                                    onClick={() => setDeleteConfirm(wq.id)}
                                    className="btn btn-outline btn-small text-red-600"
                                >
                                    <Trash2 size={14} />
                                    移除
                                </button>
                            </div>
                        </div>
                    ))
                ) : null}
            </div>
        </div>
    );
};

export default WrongQuestionBook;


// src/pages/QuizDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quiz, QuizAttempt } from '../types';
import { quizAPI } from '../services/api';
import { useCourse } from '../context/CourseContext';
import '../styles/Course.css';

const QuizDetail: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { selectedCourse } = useCourse();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState<Record<string, number[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

    useEffect(() => {
        if (!selectedCourse) {
            navigate('/courses');
            return;
        }
        if (quizId) {
            fetchQuiz();
        }
    }, [selectedCourse, quizId, navigate]);

    const fetchQuiz = async () => {
        if (!selectedCourse || !quizId) return;
        try {
            const response = await quizAPI.getQuiz(selectedCourse.id, quizId);
            setQuiz(response.data);
        } catch (err: any) {
            setError('获取测验失败');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId: string, optionIndex: number, questionType: string) => {
        setAnswers(prev => {
            const currentAnswers = prev[questionId] || [];

            if (questionType === 'single') {
                // 单选题，直接替换答案
                return {
                    ...prev,
                    [questionId]: [optionIndex]
                };
            } else {
                // 多选题，切换选项的选中状态
                let newAnswers;
                if (currentAnswers.includes(optionIndex)) {
                    // 如果已经选中，则取消选中
                    newAnswers = currentAnswers.filter(idx => idx !== optionIndex);
                } else {
                    // 否则添加到选中项中
                    newAnswers = [...currentAnswers, optionIndex].sort((a, b) => a - b);
                }

                return {
                    ...prev,
                    [questionId]: newAnswers
                };
            }
        });
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        setSubmitting(true);

        try {
            // 构造提交数据
            const submitData = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer
            }));

            if (!selectedCourse) return;
            const response = await quizAPI.submitAttempt(selectedCourse.id, quiz.id, submitData);
            setAttempt(response.data);
        } catch (err: any) {
            setError('提交测验失败: ' + (err.response?.data?.message || '未知错误'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setAnswers({});
        setAttempt(null);
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
    if (!quiz) return <div className="error-message">测验不存在</div>;

    if (attempt) {
        return (
            <div className="container">
                <div className="page-header">
                    <h1>{quiz.title} - 结果</h1>
                </div>

                <div className="quiz-result">
                    <div className="result-summary">
                        <h2>测验结果</h2>
                        <div className="score">
                            <span className="score-value">{attempt.score}</span>
                            <span className="score-total">/ {attempt.total}</span>
                        </div>
                        <p>得分率: {Math.round((attempt.score / attempt.total) * 100)}%</p>
                    </div>

                    <div className="result-details">
                        <h3>题目详情</h3>
                        {quiz.questions.map((question, index) => {
                            const result = attempt.results.find(r => r.questionId === question.id);
                            const userAnswer = answers[question.id] || [];
                            const isCorrect = result?.correct || false;

                            return (
                                <div
                                    key={question.id}
                                    className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}
                                >
                                    <div className="question-header">
                                        <h4>题目 {index + 1}: {question.question}</h4>
                                        <div className={`status-indicator ${isCorrect ? 'correct' : 'incorrect'}`}>
                                            {isCorrect ? '✓ 正确' : '✗ 错误'}
                                        </div>
                                    </div>
                                    <div className="options">
                                        {question.options?.map((option, optIndex) => {
                                            const isSelected = userAnswer.includes(optIndex);
                                            const isCorrectAnswer = question.answer?.includes(optIndex);

                                            let optionClass = "option";
                                            if (isSelected && isCorrectAnswer) {
                                                optionClass += " correct";
                                            } else if (isSelected && !isCorrectAnswer) {
                                                optionClass += " incorrect";
                                            } else if (!isSelected && isCorrectAnswer) {
                                                optionClass += " missing";
                                            }

                                            return (
                                                <div key={optIndex} className={optionClass}>
                                                    <span className="option-indicator">
                                                        {isSelected && <span className="selected-dot"></span>}
                                                    </span>
                                                    <span className="option-label">
                                                        {String.fromCharCode(65 + optIndex)}.
                                                    </span>
                                                    <span className="option-text">{option}</span>
                                                    {isSelected && !isCorrectAnswer && (
                                                        <span className="your-answer-indicator">(你的答案)</span>
                                                    )}
                                                    {!isSelected && isCorrectAnswer && (
                                                        <span className="correct-answer-indicator">(正确答案)</span>
                                                    )}
                                                    {isSelected && isCorrectAnswer && (
                                                        <span className="correct-indicator">(正确答案)</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {result && (
                                        <div className="feedback">
                                            <span className={isCorrect ? "correct-label" : "incorrect-label"}>
                                                {isCorrect ? "✓ 正确" : "✗ 错误"}
                                            </span>
                                            <span className="points">得分: {result.score}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="form-actions">
                        <button onClick={handleReset} className="btn btn-secondary">
                            重新答题
                        </button>
                        <button
                            onClick={() => navigate('/quizzes')}
                            className="btn btn-primary"
                        >
                            返回测验列表
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1>{quiz.title}</h1>
                <p>共 {quiz.questions.length} 题</p>
            </div>

            <div className="quiz-container">
                {quiz.questions.map((question, index) => (
                    <div key={question.id} className="question-card">
                        <h3>
                            题目 {index + 1}: {question.question}
                            {question.type === 'multiple' && <span className="question-type">[多选]</span>}
                        </h3>

                        <div className="options">
                            {question.options?.map((option, optIndex) => {
                                // 确保正确检查选中状态
                                const questionAnswers = answers[question.id] || [];
                                const isSelected = questionAnswers.includes(optIndex);

                                return (
                                    <div
                                        key={optIndex}
                                        className={`option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect(question.id, optIndex, question.type)}
                                    >
                                        <span className="option-indicator">
                                            {isSelected && <span className="selected-dot"></span>}
                                        </span>
                                        <span className="option-label">
                                            {String.fromCharCode(65 + optIndex)}.
                                        </span>
                                        <span className="option-text">{option}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="form-actions">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length === 0}
                        className="btn btn-primary"
                    >
                        {submitting ? '提交中...' : '提交答案'}
                    </button>
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="btn btn-outline"
                    >
                        返回测验列表
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizDetail;
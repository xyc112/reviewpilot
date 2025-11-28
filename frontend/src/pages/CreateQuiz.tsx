// src/pages/CreateQuiz.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Course.css';

const CreateQuiz: React.FC = () => {
    const { id: courseId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([
        {
            type: 'single',
            question: '',
            options: ['', ''],
            answer: [] as number[]
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate(`/courses/${courseId}/quizzes`);
        }
    }, [isAdmin, courseId, navigate]);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                type: 'single',
                question: '',
                options: ['', ''],
                answer: []
            }
        ]);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length <= 1) return;
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleAddOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push('');
        setQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex: number, oIndex: number) => {
        if (questions[qIndex].options.length <= 2) return;
        const newQuestions = [...questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        setQuestions(newQuestions);
    };

    const handleAnswerChange = (qIndex: number, optionIndex: number) => {
        const newQuestions = [...questions];
        const question = newQuestions[qIndex];

        if (question.type === 'single') {
            // 单选题，只保留一个答案
            newQuestions[qIndex].answer = [optionIndex];
        } else {
            // 多选题，可以有多个答案
            const currentAnswers = question.answer;
            if (currentAnswers.includes(optionIndex)) {
                // 如果已选择，则取消选择
                newQuestions[qIndex].answer = currentAnswers.filter(i => i !== optionIndex);
            } else {
                // 添加选择
                newQuestions[qIndex].answer = [...currentAnswers, optionIndex].sort();
            }
        }
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId) return;

        // 验证表单
        if (!title.trim()) {
            setError('请输入测验标题');
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) {
                setError(`第${i + 1}题的问题内容不能为空`);
                return;
            }

            if (q.options.some(opt => !opt.trim())) {
                setError(`第${i + 1}题的选项不能为空`);
                return;
            }

            if (q.answer.length === 0) {
                setError(`第${i + 1}题必须选择正确答案`);
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const quizData = {
                title,
                questions: questions.map(q => ({
                    type: q.type,
                    question: q.question,
                    options: q.options,
                    answer: q.answer
                }))
            };

            // @ts-ignore
            await quizAPI.createQuiz(Number(courseId), quizData);
            navigate(`/courses/${courseId}/quizzes`);
        } catch (err: any) {
            setError(err.response?.data?.message || '创建测验失败');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="container">
                <div className="error-message">无权限访问此页面</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1>创建新测验</h1>
            </div>

            <div className="content-section">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">测验标题 *</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="questions-section">
                        <h3>题目设置</h3>

                        {questions.map((question, qIndex) => (
                            <div key={qIndex} className="question-form">
                                <div className="question-header">
                                    <h4>题目 {qIndex + 1}</h4>
                                    {questions.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(qIndex)}
                                            className="btn btn-danger btn-small"
                                        >
                                            删除题目
                                        </button>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>题目类型</label>
                                    <select
                                        value={question.type}
                                        onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                                        className="form-control"
                                    >
                                        <option value="single">单选题</option>
                                        <option value="multiple">多选题</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>问题内容 *</label>
                                    <textarea
                                        value={question.question}
                                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                        className="form-control"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>选项 *</label>
                                    {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="option-input">
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                className="form-control"
                                                placeholder={`选项 ${String.fromCharCode(65 + oIndex)}`}
                                                required
                                            />
                                            <div className="option-actions">
                                                {question.options.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                        className="btn btn-outline btn-small"
                                                    >
                                                        删除
                                                    </button>
                                                )}
                                                <label className="answer-checkbox">
                                                    <input
                                                        type={question.type === 'single' ? 'radio' : 'checkbox'}
                                                        name={`answer-${qIndex}`}
                                                        checked={question.answer.includes(oIndex)}
                                                        onChange={() => handleAnswerChange(qIndex, oIndex)}
                                                    />
                                                    正确答案
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleAddOption(qIndex)}
                                        className="btn btn-outline"
                                    >
                                        + 添加选项
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="btn btn-secondary"
                        >
                            + 添加题目
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-outline"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? '创建中...' : '创建测验'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuiz;
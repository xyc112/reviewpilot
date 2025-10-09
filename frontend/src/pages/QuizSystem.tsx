import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Radio, Checkbox, Typography, Progress, Tag, Statistic, List } from 'antd'
import {
    PlayCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    HistoryOutlined,
    ReloadOutlined
} from '@ant-design/icons'
import { css } from '@emotion/react'
import { useAppStore } from '@/store/appStore'
import { QuizQuestion } from '@/types/api'
import { quizAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { DIFFICULTY_LEVELS } from '@/utils/constants'

const { Title, Text } = Typography
const { Countdown } = Statistic

const quizStyles = {
    container: css`
    padding: 24px;
  `,
    section: css`
    margin-bottom: 24px;
  `,
    card: css`
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `,
    questionCard: css`
    margin-bottom: 16px;
    border-left: 4px solid #1890ff;
  `,
    optionItem: css`
    padding: 12px 16px;
    margin: 8px 0;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      border-color: #1890ff;
      background: #f6ffed;
    }
  `,
    selectedOption: css`
    border-color: #1890ff;
    background: #e6f7ff;
  `,
    correctOption: css`
    border-color: #52c41a;
    background: #f6ffed;
  `,
    wrongOption: css`
    border-color: #ff4d4f;
    background: #fff2f0;
  `,
    resultSection: css`
    text-align: center;
    padding: 24px;
  `,
    timer: css`
    text-align: center;
    .ant-statistic-content {
      font-size: 24px;
    }
  `
}

const QuizSystem: React.FC = () => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [userAnswers, setUserAnswers] = useState<{[key: number]: string[]}>({})
    const [quizStarted, setQuizStarted] = useState(false)
    const [quizFinished, setQuizFinished] = useState(false)
    const [timeLeft, setTimeLeft] = useState(1800) // 30分钟
    const [loading, setLoading] = useState(false)
    const [score, setScore] = useState(0)
    const { currentCourse } = useAppStore()

    useEffect(() => {
        if (quizStarted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(timeLeft - 1)
            }, 1000)
            return () => clearInterval(timer)
        } else if (timeLeft === 0) {
            handleFinishQuiz()
        }
    }, [quizStarted, timeLeft])

    const startQuiz = async () => {
        setLoading(true)
        try {
            // 模拟题目数据
            const mockQuestions: QuizQuestion[] = [
                {
                    questionId: 1,
                    question: '下面关于面向对象编程的描述，哪个是正确的？',
                    options: [
                        'A. 面向对象编程只关注数据',
                        'B. 面向对象编程的核心是类和对象',
                        'C. 面向对象编程不支持代码复用',
                        'D. 面向对象编程不适合大型项目'
                    ],
                    correctAnswer: 'B',
                    explanation: '面向对象编程的核心概念是类和对象，通过封装、继承、多态等特性实现代码的模块化和复用。',
                    difficulty: 'EASY',
                    pointId: 1
                },
                {
                    questionId: 2,
                    question: '下列哪些是面向对象编程的特性？（多选）',
                    options: [
                        'A. 封装',
                        'B. 继承',
                        'C. 多态',
                        'D. 抽象'
                    ],
                    correctAnswer: 'A,B,C,D',
                    explanation: '面向对象编程的四大特性是封装、继承、多态和抽象。',
                    difficulty: 'MEDIUM',
                    pointId: 1
                }
            ]
            setQuestions(mockQuestions)
            setQuizStarted(true)
            setQuizFinished(false)
            setCurrentQuestion(0)
            setUserAnswers({})
            setTimeLeft(1800)
        } catch (error) {
            console.error('获取题目失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswerSelect = (questionId: number, answer: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: [answer]
        }))
    }

    const handleMultipleAnswerSelect = (questionId: number, answer: string) => {
        setUserAnswers(prev => {
            const currentAnswers = prev[questionId] || []
            const newAnswers = currentAnswers.includes(answer)
                ? currentAnswers.filter(a => a !== answer)
                : [...currentAnswers, answer]
            return {
                ...prev,
                [questionId]: newAnswers
            }
        })
    }

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        }
    }

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
        }
    }

    const handleFinishQuiz = () => {
        // 计算得分
        let correctCount = 0
        questions.forEach(question => {
            const userAnswer = userAnswers[question.questionId]?.sort().join(',')
            const correctAnswer = question.correctAnswer.split(',').sort().join(',')
            if (userAnswer === correctAnswer) {
                correctCount++
            }
        })

        const finalScore = Math.round((correctCount / questions.length) * 100)
        setScore(finalScore)
        setQuizFinished(true)
        setQuizStarted(false)
    }

    const getOptionStyle = (questionId: number, option: string) => {
        if (!quizFinished) {
            return userAnswers[questionId]?.includes(option)
                ? quizStyles.selectedOption
                : quizStyles.optionItem
        }

        const isCorrect = option.startsWith(questions.find(q => q.questionId === questionId)?.correctAnswer || '')
        const isSelected = userAnswers[questionId]?.includes(option)

        if (isCorrect) {
            return quizStyles.correctOption
        } else if (isSelected && !isCorrect) {
            return quizStyles.wrongOption
        }
        return quizStyles.optionItem
    }

    if (loading) {
        return <LoadingSpinner tip="加载测验题目..." />
    }

    if (!quizStarted && !quizFinished) {
        return (
            <div css={quizStyles.container}>
                <Title level={2}>知识测验</Title>
                <Row justify="center" css={quizStyles.section}>
                    <Col xs={24} lg={12}>
                        <Card css={quizStyles.card}>
                            <div css={quizStyles.resultSection}>
                                <PlayCircleOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
                                <Title level={3}>开始知识测验</Title>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                                    测验包含5道随机题目，涵盖课程核心知识点
                                </Text>
                                <div style={{ marginBottom: 24 }}>
                                    <Text strong>测验规则：</Text>
                                    <br />
                                    <Text>• 时间限制：30分钟</Text>
                                    <br />
                                    <Text>• 题目类型：单选、多选</Text>
                                    <br />
                                    <Text>• 即时评分：提交后立即查看结果</Text>
                                </div>
                                <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={startQuiz}>
                                    开始测验
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }

    if (quizFinished) {
        return (
            <div css={quizStyles.container}>
                <Title level={2}>测验结果</Title>
                <Row justify="center" css={quizStyles.section}>
                    <Col xs={24} lg={12}>
                        <Card css={quizStyles.card}>
                            <div css={quizStyles.resultSection}>
                                {score >= 60 ? (
                                    <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
                                ) : (
                                    <CloseCircleOutlined style={{ fontSize: 64, color: '#ff4d4f', marginBottom: 24 }} />
                                )}
                                <Title level={3} style={{ color: score >= 60 ? '#52c41a' : '#ff4d4f' }}>
                                    {score} 分
                                </Title>
                                <Progress
                                    percent={score}
                                    status={score >= 60 ? 'success' : 'exception'}
                                    style={{ marginBottom: 24 }}
                                />
                                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                                    {score >= 60 ? '恭喜你通过了测验！' : '需要继续努力哦！'}
                                </Text>
                                <div style={{ marginBottom: 24, textAlign: 'left' }}>
                                    <Text strong>题目解析：</Text>
                                    {questions.map((question, index) => (
                                        <div key={question.questionId} style={{ marginTop: 16 }}>
                                            <Text strong>{index + 1}. {question.question}</Text>
                                            <br />
                                            <Text type="success">正确答案: {question.correctAnswer}</Text>
                                            <br />
                                            <Text type="secondary">{question.explanation}</Text>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="primary"
                                    icon={<ReloadOutlined />}
                                    onClick={startQuiz}
                                    style={{ marginRight: 8 }}
                                >
                                    重新测验
                                </Button>
                                <Button icon={<HistoryOutlined />}>
                                    查看历史
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }

    return (
        <div css={quizStyles.container}>
            <Title level={2}>知识测验</Title>

            {/* 测验头部信息 */}
            <Row gutter={[16, 16]} css={quizStyles.section}>
                <Col xs={24} sm={8}>
                    <Card css={quizStyles.card}>
                        <div css={quizStyles.timer}>
                            <Countdown
                                title="剩余时间"
                                value={Date.now() + timeLeft * 1000}
                                onFinish={handleFinishQuiz}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card css={quizStyles.card}>
                        <Statistic
                            title="当前进度"
                            value={currentQuestion + 1}
                            suffix={`/ ${questions.length}`}
                        />
                        <Progress
                            percent={Math.round(((currentQuestion + 1) / questions.length) * 100)}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card css={quizStyles.card}>
                        <Statistic
                            title="已答题目"
                            value={Object.keys(userAnswers).length}
                            suffix={`/ ${questions.length}`}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 题目内容 */}
            {questions.length > 0 && (
                <Card
                    css={[quizStyles.card, quizStyles.questionCard]}
                    title={
                        <div>
                            <Text strong>第 {currentQuestion + 1} 题</Text>
                            <Tag
                                color={DIFFICULTY_LEVELS[questions[currentQuestion].difficulty].color}
                                style={{ marginLeft: 8 }}
                            >
                                {DIFFICULTY_LEVELS[questions[currentQuestion].difficulty].label}
                            </Tag>
                        </div>
                    }
                >
                    <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 16 }}>
                        {questions[currentQuestion].question}
                    </Text>

                    <div>
                        {questions[currentQuestion].options.map((option, index) => (
                            <div
                                key={index}
                                css={[
                                    quizStyles.optionItem,
                                    getOptionStyle(questions[currentQuestion].questionId, option.charAt(0))
                                ]}
                                onClick={() => {
                                    if (questions[currentQuestion].correctAnswer.includes(',')) {
                                        handleMultipleAnswerSelect(questions[currentQuestion].questionId, option.charAt(0))
                                    } else {
                                        handleAnswerSelect(questions[currentQuestion].questionId, option.charAt(0))
                                    }
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>

                    {/* 导航按钮 */}
                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            onClick={prevQuestion}
                            disabled={currentQuestion === 0}
                        >
                            上一题
                        </Button>

                        {currentQuestion === questions.length - 1 ? (
                            <Button type="primary" onClick={handleFinishQuiz}>
                                提交答卷
                            </Button>
                        ) : (
                            <Button type="primary" onClick={nextQuestion}>
                                下一题
                            </Button>
                        )}
                    </div>
                </Card>
            )}
        </div>
    )
}

export default QuizSystem
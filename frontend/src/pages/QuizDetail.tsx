import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Typography,
  Radio,
  Checkbox,
  Alert,
  Spin,
  Tag,
  Divider,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import type { Quiz, QuizAttempt, AttemptResult } from "../types";
import { quizAPI, wrongQuestionAPI } from "../services";
import { useCourseStore } from "../stores";
import { useToast } from "../components";
import { getErrorMessage } from "../utils";

const { Title, Text, Paragraph } = Typography;

const QuizDetail = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse || currentStudyingCourse;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [addingToWrongBook, setAddingToWrongBook] = useState<Set<string>>(
    new Set(),
  );
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (!course) {
      navigate("/courses");
      return;
    }
    if (quizId) {
      fetchQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchQuiz 依赖 course, quizId
  }, [course, quizId, navigate]);

  const fetchQuiz = async () => {
    if (!course || !quizId) return;
    try {
      const response = await quizAPI.getQuiz(course.id, quizId);
      setQuiz(response.data);
    } catch {
      setError("获取测验失败");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (
    questionId: string,
    optionIndex: number,
    questionType: string,
  ) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];

      if (questionType === "single" || questionType === "truefalse") {
        return {
          ...prev,
          [questionId]: [optionIndex],
        };
      } else {
        let newAnswers;
        if (currentAnswers.includes(optionIndex)) {
          newAnswers = currentAnswers.filter((idx) => idx !== optionIndex);
        } else {
          newAnswers = [...currentAnswers, optionIndex].sort((a, b) => a - b);
        }

        return {
          ...prev,
          [questionId]: newAnswers,
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setSubmitting(true);

    try {
      const submitData = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        }),
      );

      if (!course) return;
      const response = await quizAPI.submitAttempt(
        course.id,
        quiz.id,
        submitData,
      );
      setAttempt(response.data);

      if (response.data?.results) {
        const wrongQuestions: {
          questionEntityId: number;
          userAnswer: number[];
          questionId: string;
        }[] = [];
        response.data.results.forEach((result: AttemptResult) => {
          if (!result.correct && result.questionEntityId) {
            const questionId = result.questionId;
            const userAnswer = answers[questionId] || [];
            wrongQuestions.push({
              questionEntityId: result.questionEntityId,
              userAnswer: userAnswer,
              questionId: questionId,
            });
          }
        });

        for (const wq of wrongQuestions) {
          try {
            await wrongQuestionAPI.addWrongQuestion(
              course.id,
              wq.questionEntityId,
              wq.userAnswer,
            );
          } catch (err: unknown) {
            console.error("Failed to add wrong question:", getErrorMessage(err));
          }
        }

        if (wrongQuestions.length > 0) {
          success(`已自动添加 ${wrongQuestions.length} 道错题到错题本`);
        }
      }
    } catch (err: unknown) {
      setError("提交测验失败: " + getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setAttempt(null);
    setAddingToWrongBook(new Set());
  };

  const handleAddToWrongBook = async (
    questionEntityId: number,
    userAnswer: number[],
    questionId: string,
  ) => {
    if (!course) return;
    try {
      setAddingToWrongBook((prev) => new Set(prev).add(questionId));
      await wrongQuestionAPI.addWrongQuestion(
        course.id,
        questionEntityId,
        userAnswer,
      );
      success("已添加到错题本");
    } catch (err: unknown) {
      showError("添加失败: " + getErrorMessage(err));
      setAddingToWrongBook((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  if (!course) {
    return (
      <Alert
        message="请先选择一个课程"
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate("/courses")}>
            前往课程列表
          </Button>
        }
        style={{ margin: "2rem" }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert title={error} type="error" showIcon style={{ margin: "2rem" }} />
    );
  }

  if (!quiz) {
    return (
      <Alert
        message="测验不存在"
        type="error"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

  if (attempt) {
    const scorePercentage = Math.round((attempt.score / attempt.total) * 100);
    const isPassed = scorePercentage >= 60;

    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          {/* 结果摘要 */}
          <Card
            style={{
              background: isPassed
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
              textAlign: "center",
            }}
            bodyStyle={{ padding: "3rem 2rem" }}
          >
            <Space orientation="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ fontSize: "4rem" }}>{isPassed ? "🎉" : "📝"}</div>
              <Title level={2} style={{ color: "#fff", margin: 0 }}>
                测验完成
              </Title>
              <Row gutter={16} justify="center">
                <Col>
                  <Statistic
                    value={attempt.score}
                    suffix={`/ ${attempt.total}`}
                    valueStyle={{ color: "#fff", fontSize: "3rem" }}
                  />
                </Col>
              </Row>
              <Tag
                color={isPassed ? "success" : "error"}
                style={{
                  fontSize: "1.5rem",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "2rem",
                }}
              >
                {scorePercentage}%
              </Tag>
              <Text style={{ color: "#fff", fontSize: "1.125rem" }}>
                {isPassed
                  ? "恭喜！您通过了本次测验"
                  : "还需要继续努力，建议重新学习相关内容"}
              </Text>
            </Space>
          </Card>

          {/* 题目解析 */}
          <Card>
            <Title level={3}>题目解析</Title>
            <Space orientation="vertical" size="large" style={{ width: "100%" }}>
              {quiz.questions.map((question, index) => {
                const result = attempt.results.find(
                  (r) => r.questionId === question.id,
                );
                const userAnswer = answers[question.id] || [];
                const isCorrect = result?.correct || false;
                const correctAnswerIndices = question.answer || [];

                return (
                  <Card
                    key={question.id}
                    style={{
                      border: `2px solid ${isCorrect ? "#52c41a" : "#ff4d4f"}`,
                      backgroundColor: isCorrect ? "#f6ffed" : "#fff2f0",
                    }}
                  >
                    <Space
                      orientation="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Tag color="default">题目 {index + 1}</Tag>
                        <Tag
                          icon={
                            isCorrect ? (
                              <CheckCircleOutlined />
                            ) : (
                              <CloseCircleOutlined />
                            )
                          }
                          color={isCorrect ? "success" : "error"}
                        >
                          {isCorrect ? "回答正确" : "回答错误"}
                        </Tag>
                      </div>

                      <Title level={4} style={{ margin: 0 }}>
                        {question.question}
                        {question.type === "multiple" && (
                          <Tag color="blue" style={{ marginLeft: "0.5rem" }}>
                            多选
                          </Tag>
                        )}
                        {question.type === "truefalse" && (
                          <Tag color="orange" style={{ marginLeft: "0.5rem" }}>
                            判断
                          </Tag>
                        )}
                      </Title>

                      <Space
                        orientation="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        {question.options?.map((option, optIndex) => {
                          const isSelected = userAnswer.includes(optIndex);
                          const isCorrectAnswer =
                            correctAnswerIndices.includes(optIndex);
                          const isCorrectlySelected =
                            isSelected && isCorrectAnswer;
                          const isIncorrectlySelected =
                            !isCorrect && isSelected && !isCorrectAnswer;

                          let borderColor = "#d9d9d9";
                          let backgroundColor = "#fafafa";
                          let borderStyle: "solid" | "dashed" = "solid";
                          if (isCorrectlySelected) {
                            borderColor = "#52c41a";
                            backgroundColor = "#f6ffed";
                          } else if (isIncorrectlySelected) {
                            borderColor = "#ff4d4f";
                            backgroundColor = "#fff2f0";
                          } else if (!isSelected && isCorrectAnswer) {
                            borderColor = "#52c41a";
                            backgroundColor = "#f6ffed";
                            borderStyle = "dashed";
                          }

                          return (
                            <Card
                              key={optIndex}
                              size="small"
                              style={{
                                border: `2px ${borderStyle} ${borderColor}`,
                                backgroundColor,
                              }}
                            >
                              <Space>
                                {isCorrectlySelected ? (
                                  <CheckCircleOutlined
                                    style={{
                                      color: "#52c41a",
                                      fontSize: "1.25rem",
                                    }}
                                  />
                                ) : isIncorrectlySelected ? (
                                  <CloseCircleOutlined
                                    style={{
                                      color: "#ff4d4f",
                                      fontSize: "1.25rem",
                                    }}
                                  />
                                ) : isCorrectAnswer ? (
                                  <CheckCircleOutlined
                                    style={{
                                      color: "#52c41a",
                                      fontSize: "1.25rem",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "1rem",
                                      height: "1rem",
                                      border: "2px solid #d9d9d9",
                                      borderRadius: "50%",
                                    }}
                                  />
                                )}
                                <Text strong>
                                  {String.fromCharCode(65 + optIndex)}.
                                </Text>
                                <Text>{option}</Text>
                                <Space style={{ marginLeft: "auto" }}>
                                  {isSelected ? <Tag
                                      color={
                                        isCorrectlySelected
                                          ? "success"
                                          : "error"
                                      }
                                    >
                                      {isCorrectlySelected
                                        ? "你的答案（正确）"
                                        : "你的答案"}
                                    </Tag> : null}
                                  {!isSelected && isCorrectAnswer ? <Tag color="success">正确答案</Tag> : null}
                                </Space>
                              </Space>
                            </Card>
                          );
                        })}
                      </Space>

                      {question.explanation ? <Card
                          size="small"
                          style={{
                            backgroundColor: "#e6f7ff",
                            borderLeft: "4px solid #1890ff",
                          }}
                        >
                          <Space orientation="vertical" size="small">
                            <Text strong style={{ color: "#1890ff" }}>
                              📖 解析
                            </Text>
                            <Paragraph style={{ margin: 0 }}>
                              {question.explanation}
                            </Paragraph>
                          </Space>
                        </Card> : null}

                      <Divider style={{ margin: "0.5rem 0" }} />

                      <Space>
                        <Text type="secondary">本题得分：</Text>
                        <Text
                          strong
                          style={{
                            color: isCorrect ? "#52c41a" : "#ff4d4f",
                            fontSize: "1rem",
                          }}
                        >
                          {result?.score || 0} /{" "}
                          {Math.round(100 / quiz.questions.length) +
                            (index < 100 % quiz.questions.length ? 1 : 0)}
                        </Text>
                      </Space>

                      {!isCorrect && result?.questionEntityId ? <Button
                          icon={<BookOutlined />}
                          onClick={() =>
                            handleAddToWrongBook(
                              result.questionEntityId!,
                              userAnswer,
                              question.id,
                            )
                          }
                          disabled={addingToWrongBook.has(question.id)}
                          size="small"
                        >
                          {addingToWrongBook.has(question.id)
                            ? "已添加"
                            : "添加到错题本"}
                        </Button> : null}
                    </Space>
                  </Card>
                );
              })}
            </Space>
          </Card>

          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重新答题
            </Button>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/quizzes")}
            >
              返回测验列表
            </Button>
          </Space>
        </Space>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {quiz.questions.map((question, index) => (
          <Card key={question.id} title={`题目 ${index + 1}`}>
            <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={4} style={{ margin: 0 }}>
                {question.question}
                {question.type === "multiple" && (
                  <Tag color="blue" style={{ marginLeft: "0.5rem" }}>
                    多选
                  </Tag>
                )}
                {question.type === "truefalse" && (
                  <Tag color="orange" style={{ marginLeft: "0.5rem" }}>
                    判断
                  </Tag>
                )}
              </Title>

              {question.type === "single" || question.type === "truefalse" ? (
                <Radio.Group
                  value={
                    answers[question.id] && answers[question.id].length > 0
                      ? answers[question.id][0]
                      : undefined
                  }
                  onChange={(e) =>
                    { handleOptionSelect(
                      question.id,
                      e.target.value,
                      question.type,
                    ); }
                  }
                >
                  <Space orientation="vertical" size="middle">
                    {question.options?.map((option, optIndex) => (
                      <Radio key={optIndex} value={optIndex}>
                        <Text>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Text>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              ) : (
                <Checkbox.Group
                  value={answers[question.id] || []}
                  onChange={(values) => {
                    const newAnswers = values;
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: newAnswers,
                    }));
                  }}
                >
                  <Space orientation="vertical" size="middle">
                    {question.options?.map((option, optIndex) => (
                      <Checkbox key={optIndex} value={optIndex}>
                        <Text>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Text>
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              )}
            </Space>
          </Card>
        ))}

        <Space>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length === 0}
            loading={submitting}
          >
            {submitting ? "提交中..." : "提交答案"}
          </Button>
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/quizzes")}
          >
            返回测验列表
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default QuizDetail;

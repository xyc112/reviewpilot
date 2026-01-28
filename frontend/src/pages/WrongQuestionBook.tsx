import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Spin,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Empty,
  Statistic,
  Row,
  Col,
  Input,
  Radio,
  Checkbox,
  Divider,
} from "antd";
import {
  BookOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { WrongQuestion, Question } from "../types";
import { wrongQuestionAPI, quizAPI } from "../services";
import { useAuthStore } from "../stores/authStore";
import { useCourseStore } from "../stores/courseStore";
import { useTheme } from "../components/ThemeProvider";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";

const { Title, Text, Paragraph } = Typography;

const WrongQuestionBook: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentStudyingCourse = useCourseStore((state) => state.currentStudyingCourse);
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { success, error: showError } = useToast();

  const course = currentStudyingCourse || selectedCourse;
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "notMastered" | "mastered">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [practicingQuestion, setPracticingQuestion] =
    useState<WrongQuestion | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<
    Record<number, number[]>
  >({});
  const [showPracticeResult, setShowPracticeResult] = useState<
    Record<number, boolean>
  >({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    mastered: number;
    notMastered: number;
  } | null>(null);

  useEffect(() => {
    if (!course) {
      navigate("/courses");
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
      const mastered = filter === "all" ? undefined : filter === "mastered";
      const response = await wrongQuestionAPI.getWrongQuestions(
        course.id,
        mastered,
      );
      setWrongQuestions(response.data);
    } catch (err: any) {
      setError(
        "获取错题列表失败: " + (err.response?.data?.message || err.message),
      );
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
        notMastered: response.data.notMastered || 0,
      });
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
      setStats({ total: 0, mastered: 0, notMastered: 0 });
    }
  };

  const handleMarkAsMastered = async (wrongQuestionId: number) => {
    if (!course) return;
    try {
      await wrongQuestionAPI.markAsMastered(course.id, wrongQuestionId);
      success("已标记为已掌握");
      fetchWrongQuestions();
      fetchStats();
    } catch (err: any) {
      showError("标记失败: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRemove = async () => {
    if (!deleteConfirm || !course) return;
    try {
      await wrongQuestionAPI.removeWrongQuestion(course.id, deleteConfirm);
      success("已从错题本移除");
      setDeleteConfirm(null);
      fetchWrongQuestions();
      fetchStats();
    } catch (err: any) {
      showError("移除失败: " + (err.response?.data?.message || err.message));
    }
  };

  const handleStartPractice = (wrongQuestion: WrongQuestion) => {
    setPracticingQuestion(wrongQuestion);
    setPracticeAnswers({});
    setShowPracticeResult({});
  };

  const handlePracticeOptionSelect = (
    questionId: number,
    optionIndex: number,
    questionType: string,
  ) => {
    setPracticeAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      if (questionType === "single" || questionType === "truefalse") {
        return { ...prev, [questionId]: [optionIndex] };
      } else {
        let newAnswers;
        if (currentAnswers.includes(optionIndex)) {
          newAnswers = currentAnswers.filter((idx) => idx !== optionIndex);
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
      await wrongQuestionAPI.practiceWrongQuestion(
        course.id,
        practicingQuestion.id,
      );

      // 检查答案是否正确
      const userAnswer = practiceAnswers[practicingQuestion.questionId] || [];
      const correctAnswer = practicingQuestion.question?.answer || [];
      const isCorrect =
        JSON.stringify([...userAnswer].sort()) ===
        JSON.stringify([...correctAnswer].sort());

      setShowPracticeResult({ [practicingQuestion.questionId]: true });

      if (isCorrect) {
        success("回答正确！");
      } else {
        showError("回答错误，请继续练习");
      }

      fetchWrongQuestions();
    } catch (err: any) {
      showError("提交失败: " + (err.response?.data?.message || err.message));
    }
  };

  const handleClosePractice = () => {
    setPracticingQuestion(null);
    setPracticeAnswers({});
    setShowPracticeResult({});
  };

  // 过滤错题
  const filteredWrongQuestions = useMemo(() => {
    return wrongQuestions.filter((wq) => {
      // 搜索过滤
      const matchesSearch =
        !searchQuery ||
        (wq.question?.question &&
          wq.question.question
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [wrongQuestions, searchQuery]);

  if (!course) {
    return (
      <Alert
        message="请先选择一个课程"
        type="warning"
        showIcon
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

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
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
        <Row gutter={16} style={{ marginBottom: "2rem" }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="总错题数"
                value={stats.total}
                valueStyle={{ fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="未掌握"
                value={stats.notMastered}
                valueStyle={{ color: "#ff4d4f", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="已掌握"
                value={stats.mastered}
                valueStyle={{ color: "#52c41a", fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Space wrap style={{ marginBottom: "1.5rem" }}>
        <Button
          type={filter === "all" ? "primary" : "default"}
          onClick={() => setFilter("all")}
        >
          全部
        </Button>
        <Button
          type={filter === "notMastered" ? "primary" : "default"}
          onClick={() => setFilter("notMastered")}
        >
          未掌握
        </Button>
        <Button
          type={filter === "mastered" ? "primary" : "default"}
          onClick={() => setFilter("mastered")}
        >
          已掌握
        </Button>
      </Space>

      {/* 搜索栏 */}
      <Input.Search
        placeholder="搜索错题内容..."
        allowClear
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "2rem", maxWidth: 600 }}
      />

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: "1.5rem" }}
        />
      )}

      {practicingQuestion && practicingQuestion.question && (
        <Card
          style={{ marginBottom: "2rem" }}
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                练习错题
              </Title>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleClosePractice}
              />
            </div>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Title level={5} style={{ margin: "0 0 1rem 0" }}>
                {practicingQuestion.question.question}
                {practicingQuestion.question.type === "multiple" && (
                  <Tag color="blue" style={{ marginLeft: "0.5rem" }}>
                    多选
                  </Tag>
                )}
                {practicingQuestion.question.type === "truefalse" && (
                  <Tag color="orange" style={{ marginLeft: "0.5rem" }}>
                    判断
                  </Tag>
                )}
              </Title>
            </div>

            {practicingQuestion.question.type === "single" ||
            practicingQuestion.question.type === "truefalse" ? (
              <Radio.Group
                value={practiceAnswers[practicingQuestion.questionId]?.[0]}
                onChange={(e) => {
                  if (!showPracticeResult[practicingQuestion.questionId]) {
                    handlePracticeOptionSelect(
                      practicingQuestion.questionId,
                      e.target.value,
                      practicingQuestion.question.type,
                    );
                  }
                }}
                disabled={
                  showPracticeResult[practicingQuestion.questionId] || false
                }
              >
                <Space direction="vertical" size="middle">
                  {practicingQuestion.question.options?.map(
                    (option, optIndex) => {
                      const isSelected = (
                        practiceAnswers[practicingQuestion.questionId] || []
                      ).includes(optIndex);
                      const showResult =
                        showPracticeResult[practicingQuestion.questionId];
                      const isCorrect =
                        practicingQuestion.question?.answer?.includes(optIndex);
                      const isCorrectlySelected = isSelected && isCorrect;
                      const isIncorrectlySelected = isSelected && !isCorrect;

                      return (
                        <Radio
                          key={optIndex}
                          value={optIndex}
                          style={{
                            border:
                              showResult && isCorrectlySelected
                                ? "2px solid #52c41a"
                                : showResult && isIncorrectlySelected
                                  ? "2px solid #ff4d4f"
                                  : showResult && !isSelected && isCorrect
                                    ? "2px dashed #52c41a"
                                    : "none",
                            padding: "0.5rem",
                            borderRadius: "0.5rem",
                            backgroundColor:
                              showResult && isCorrectlySelected
                                ? "#f6ffed"
                                : showResult && isIncorrectlySelected
                                  ? "#fff2f0"
                                  : showResult && !isSelected && isCorrect
                                    ? "#f6ffed"
                                    : "transparent",
                          }}
                        >
                          <Text strong style={{ marginRight: "0.5rem" }}>
                            {String.fromCharCode(65 + optIndex)}.
                          </Text>
                          {option}
                          {showResult && (
                            <Space style={{ marginLeft: "0.5rem" }}>
                              {isCorrectlySelected && (
                                <Tag color="success">你的答案（正确）</Tag>
                              )}
                              {isIncorrectlySelected && (
                                <Tag color="error">你的答案</Tag>
                              )}
                              {!isSelected && isCorrect && (
                                <Tag color="success">正确答案</Tag>
                              )}
                            </Space>
                          )}
                        </Radio>
                      );
                    },
                  )}
                </Space>
              </Radio.Group>
            ) : (
              <Checkbox.Group
                value={practiceAnswers[practicingQuestion.questionId] || []}
                onChange={(values) => {
                  if (!showPracticeResult[practicingQuestion.questionId]) {
                    const newAnswers = values as number[];
                    setPracticeAnswers((prev) => ({
                      ...prev,
                      [practicingQuestion.questionId]: newAnswers,
                    }));
                  }
                }}
                disabled={
                  showPracticeResult[practicingQuestion.questionId] || false
                }
              >
                <Space direction="vertical" size="middle">
                  {practicingQuestion.question.options?.map(
                    (option, optIndex) => {
                      const isSelected = (
                        practiceAnswers[practicingQuestion.questionId] || []
                      ).includes(optIndex);
                      const showResult =
                        showPracticeResult[practicingQuestion.questionId];
                      const isCorrect =
                        practicingQuestion.question?.answer?.includes(optIndex);
                      const isCorrectlySelected = isSelected && isCorrect;
                      const isIncorrectlySelected = isSelected && !isCorrect;

                      return (
                        <Checkbox
                          key={optIndex}
                          value={optIndex}
                          style={{
                            border:
                              showResult && isCorrectlySelected
                                ? "2px solid #52c41a"
                                : showResult && isIncorrectlySelected
                                  ? "2px solid #ff4d4f"
                                  : showResult && !isSelected && isCorrect
                                    ? "2px dashed #52c41a"
                                    : "none",
                            padding: "0.5rem",
                            borderRadius: "0.5rem",
                            backgroundColor:
                              showResult && isCorrectlySelected
                                ? "#f6ffed"
                                : showResult && isIncorrectlySelected
                                  ? "#fff2f0"
                                  : showResult && !isSelected && isCorrect
                                    ? "#f6ffed"
                                    : "transparent",
                          }}
                        >
                          <Text strong style={{ marginRight: "0.5rem" }}>
                            {String.fromCharCode(65 + optIndex)}.
                          </Text>
                          {option}
                          {showResult && (
                            <Space style={{ marginLeft: "0.5rem" }}>
                              {isCorrectlySelected && (
                                <Tag color="success">你的答案（正确）</Tag>
                              )}
                              {isIncorrectlySelected && (
                                <Tag color="error">你的答案</Tag>
                              )}
                              {!isSelected && isCorrect && (
                                <Tag color="success">正确答案</Tag>
                              )}
                            </Space>
                          )}
                        </Checkbox>
                      );
                    },
                  )}
                </Space>
              </Checkbox.Group>
            )}

            {showPracticeResult[practicingQuestion.questionId] && (
              <Card
                size="small"
                style={{
                  backgroundColor: "#e6f7ff",
                  borderLeft: "4px solid #1890ff",
                }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text
                      strong
                      type="secondary"
                      style={{ fontSize: "0.875rem" }}
                    >
                      正确答案：
                    </Text>
                    <Text strong style={{ marginLeft: "0.5rem" }}>
                      {practicingQuestion.question.answer
                        ?.map((idx) => String.fromCharCode(65 + idx))
                        .join(", ")}
                    </Text>
                  </div>
                  {practicingQuestion.question.explanation && (
                    <>
                      <Divider style={{ margin: "0.5rem 0" }} />
                      <div>
                        <Text
                          strong
                          style={{ fontSize: "0.875rem", color: "#1890ff" }}
                        >
                          解析：
                        </Text>
                        <Paragraph style={{ margin: "0.5rem 0 0 0" }}>
                          {practicingQuestion.question.explanation}
                        </Paragraph>
                      </div>
                    </>
                  )}
                </Space>
              </Card>
            )}

            <Space>
              {!showPracticeResult[practicingQuestion.questionId] ? (
                <Button type="primary" onClick={handleSubmitPractice}>
                  提交答案
                </Button>
              ) : (
                <Button onClick={handleClosePractice}>关闭</Button>
              )}
            </Space>
          </Space>
        </Card>
      )}

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {!loading && wrongQuestions.length === 0 ? (
          <Empty
            image={<BookOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
            description={
              <Space direction="vertical" size="small">
                <Title level={4} style={{ margin: 0 }}>
                  暂无错题
                </Title>
                <Text type="secondary">
                  {filter === "mastered"
                    ? "暂无已掌握的错题"
                    : filter === "notMastered"
                      ? "暂无未掌握的错题"
                      : "完成测验后，错题会自动添加到错题本"}
                </Text>
              </Space>
            }
          />
        ) : filteredWrongQuestions.length === 0 && searchQuery ? (
          <Empty
            image={<BookOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />}
            description={
              <Space direction="vertical" size="small">
                <Title level={4} style={{ margin: 0 }}>
                  未找到匹配的错题
                </Title>
                <Text type="secondary">尝试调整搜索条件</Text>
              </Space>
            }
          >
            <Button type="primary" onClick={() => setSearchQuery("")}>
              清除搜索
            </Button>
          </Empty>
        ) : filteredWrongQuestions.length > 0 ? (
          filteredWrongQuestions.map((wq) => (
            <Card
              key={wq.id}
              style={{ marginBottom: "1rem" }}
              actions={[
                <Space key="actions">
                  <Button
                    size="small"
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={() => handleStartPractice(wq)}
                  >
                    重新练习
                  </Button>
                  {!wq.mastered && (
                    <Button
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleMarkAsMastered(wq.id)}
                    >
                      标记为已掌握
                    </Button>
                  )}
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setDeleteConfirm(wq.id)}
                  >
                    移除
                  </Button>
                </Space>,
              ]}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ margin: "0 0 0.5rem 0" }}>
                      {wq.question?.question || "题目加载中..."}
                    </Title>
                    <Space wrap>
                      <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                        来自测验: {wq.quizId}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                        练习次数: {wq.practiceCount}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                        添加时间:{" "}
                        {new Date(wq.addedAt).toLocaleDateString("zh-CN")}
                      </Text>
                    </Space>
                  </div>
                  <Tag color={wq.mastered ? "success" : "warning"}>
                    {wq.mastered ? "已掌握" : "未掌握"}
                  </Tag>
                </div>
              </Space>
            </Card>
          ))
        ) : null}
      </Space>
    </div>
  );
};

export default WrongQuestionBook;

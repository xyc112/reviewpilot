import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Select,
  Alert,
  Radio,
  Checkbox,
  Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined, MinusOutlined } from "@ant-design/icons";
import { quizAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";

const { TextArea } = Input;
const { Title } = Typography;

const CreateQuiz = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse || currentStudyingCourse;
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      type: "single",
      question: "",
      options: ["", ""],
      answer: [] as number[],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/quizzes");
    }
    if (!course) {
      navigate("/courses");
    }
  }, [isAdmin, course, navigate]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "single",
        question: "",
        options: ["", ""],
        answer: [],
      },
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

  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string,
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push("");
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    if (questions[qIndex].options.length <= 2) return;
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    // 如果删除的选项是正确答案，需要从答案中移除
    const answerIndex = newQuestions[qIndex].answer.indexOf(oIndex);
    if (answerIndex !== -1) {
      newQuestions[qIndex].answer.splice(answerIndex, 1);
    }
    // 调整答案索引（删除选项后，后面的选项索引需要减1）
    newQuestions[qIndex].answer = newQuestions[qIndex].answer
      .map((ans) => (ans > oIndex ? ans - 1 : ans))
      .filter((ans) => ans >= 0);
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (qIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[qIndex];

    if (question.type === "single" || question.type === "truefalse") {
      newQuestions[qIndex].answer = [optionIndex];
    } else {
      const currentAnswers = question.answer;
      if (currentAnswers.includes(optionIndex)) {
        newQuestions[qIndex].answer = currentAnswers.filter(
          (i) => i !== optionIndex,
        );
      } else {
        newQuestions[qIndex].answer = [...currentAnswers, optionIndex].sort();
      }
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    if (!title.trim()) {
      setError("请输入测验标题");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`第${i + 1}题的问题内容不能为空`);
        return;
      }

      if (q.options.some((opt) => !opt.trim())) {
        setError(`第${i + 1}题的选项不能为空`);
        return;
      }

      if (q.answer.length === 0) {
        setError(`第${i + 1}题必须选择正确答案`);
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const quizData = {
        title,
        questions: questions.map((q) => ({
          type: q.type,
          question: q.question,
          options: q.options,
          answer: q.answer,
        })),
      };

      await quizAPI.createQuiz(course.id, quizData);
      navigate("/quizzes");
    } catch (err: any) {
      setError(err.response?.data?.message || "创建测验失败");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Alert
        message="无权限访问此页面"
        type="error"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

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

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1rem" }}>
      <Card>
        <Title level={2}>创建新测验</Title>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="测验标题"
            required
            rules={[{ required: true, message: "请输入测验标题" }]}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入测验标题"
            />
          </Form.Item>

          <Divider orientation="left">题目设置</Divider>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {questions.map((question, qIndex) => (
              <Card
                key={qIndex}
                title={`题目 ${qIndex + 1}`}
                extra={
                  questions.length > 1 && (
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      删除题目
                    </Button>
                  )
                }
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Form.Item label="题目类型">
                    <Select
                      value={question.type}
                      onChange={(value) =>
                        handleQuestionChange(qIndex, "type", value)
                      }
                      style={{ width: "100%" }}
                    >
                      <Select.Option value="single">单选题</Select.Option>
                      <Select.Option value="multiple">多选题</Select.Option>
                      <Select.Option value="truefalse">判断题</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="问题内容" required>
                    <TextArea
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "question", e.target.value)
                      }
                      rows={3}
                      placeholder="输入问题内容"
                    />
                  </Form.Item>

                  <Form.Item label="选项" required>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      {question.options.map((option, oIndex) => (
                        <Space.Compact key={oIndex} style={{ width: "100%" }}>
                          <Input
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`选项 ${String.fromCharCode(65 + oIndex)}`}
                            disabled={question.type === "truefalse"}
                            style={{ flex: 1 }}
                          />
                          {question.type === "single" ||
                          question.type === "truefalse" ? (
                            <Radio
                              checked={question.answer.includes(oIndex)}
                              onChange={() =>
                                handleAnswerChange(qIndex, oIndex)
                              }
                            >
                              正确答案
                            </Radio>
                          ) : (
                            <Checkbox
                              checked={question.answer.includes(oIndex)}
                              onChange={() =>
                                handleAnswerChange(qIndex, oIndex)
                              }
                            >
                              正确答案
                            </Checkbox>
                          )}
                          {question.options.length > 2 &&
                            question.type !== "truefalse" && (
                              <Button
                                danger
                                icon={<MinusOutlined />}
                                onClick={() =>
                                  handleRemoveOption(qIndex, oIndex)
                                }
                              />
                            )}
                        </Space.Compact>
                      ))}
                      {question.type !== "truefalse" && (
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => handleAddOption(qIndex)}
                        >
                          添加选项
                        </Button>
                      )}
                      {question.type === "truefalse" && (
                        <Alert
                          message='判断题固定为"正确"和"错误"两个选项'
                          type="info"
                          showIcon
                        />
                      )}
                    </Space>
                  </Form.Item>
                </Space>
              </Card>
            ))}

            <Button icon={<PlusOutlined />} onClick={handleAddQuestion} block>
              添加题目
            </Button>
          </Space>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginTop: "1.5rem" }}
            />
          )}

          <Form.Item style={{ marginTop: "1.5rem" }}>
            <Space>
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                创建测验
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateQuiz;

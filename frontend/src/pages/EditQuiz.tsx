import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Minus } from "lucide-react";
import type { Quiz, QuizQuestion } from "../types";
import { quizAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import { getErrorMessage } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "../components";

const EditQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse ?? currentStudyingCourse;
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<
    (QuizQuestion & { options: string[]; answer: number[] })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!course) {
      void navigate("/courses");
      return;
    }
    if (quizId) {
      void fetchQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchQuiz 依赖 course, quizId
  }, [course, quizId, navigate]);

  const fetchQuiz = async () => {
    if (!course || !quizId) return;
    try {
      const response = await quizAPI.getQuiz(course.id, quizId);
      const quizData = response.data;
      setQuiz(quizData);
      setTitle(quizData.title);
      setQuestions(
        quizData.questions.map((q) => ({
          ...q,
          answer: q.answer ?? [],
        })),
      );
    } catch (err: unknown) {
      console.error("获取测验失败:", err);
      setError("获取测验失败: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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

  const handleQuestionChange = (
    index: number,
    field: string,
    value: string | string[] | number[],
  ) => {
    const newQuestions = [...questions];
    (newQuestions[index] as Record<string, unknown>)[field] = value;

    if (field === "type" && value === "truefalse") {
      newQuestions[index].options = ["正确", "错误"];
      newQuestions[index].answer = [];
    }

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
    const answerIndex = newQuestions[qIndex].answer.indexOf(oIndex);
    if (answerIndex !== -1) {
      newQuestions[qIndex].answer.splice(answerIndex, 1);
    }
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

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!course || !quizId || !quiz) return;

    if (!title.trim()) {
      setError("请输入测验标题");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`第${String(i + 1)}题的问题内容不能为空`);
        return;
      }

      if (q.options.some((opt) => !opt.trim())) {
        setError(`第${String(i + 1)}题的选项不能为空`);
        return;
      }

      if (q.answer.length === 0) {
        setError(`第${String(i + 1)}题必须选择正确答案`);
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const quizData = {
        title,
        questions: questions.map((q) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          answer: q.answer,
        })),
      };

      await quizAPI.updateQuiz(course.id, quizId, quizData);
      void navigate("/quizzes");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "更新测验失败");
    } finally {
      setSaving(false);
    }
  };

  if (!course) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>请先选择一个课程</AlertTitle>
          <div className="mt-2">
            <Button onClick={() => void navigate("/courses")}>
              前往课程列表
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>测验不存在</AlertTitle>
        </Alert>
      </div>
    );
  }

  const canEdit = isAdmin || user?.id === quiz.authorId;

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>无权限编辑此测验</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">编辑测验</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(e);
            }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="quiz-title">测验标题</Label>
              <Input
                id="quiz-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                placeholder="输入测验标题"
                required
              />
            </div>

            <Separator className="my-2" />

            <div className="flex flex-col gap-4">
              <h3 className="text-base font-medium">题目设置</h3>
              {questions.map((question, qIndex) => (
                <Card key={qIndex}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base">
                      题目 {qIndex + 1}
                    </CardTitle>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          handleRemoveQuestion(qIndex);
                        }}
                      >
                        <Trash2 className="size-4" />
                        删除题目
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label>题目类型</Label>
                      <Select
                        value={question.type}
                        onValueChange={(
                          value: "single" | "multiple" | "truefalse",
                        ) => {
                          handleQuestionChange(qIndex, "type", value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">单选题</SelectItem>
                          <SelectItem value="multiple">多选题</SelectItem>
                          <SelectItem value="truefalse">判断题</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>问题内容</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => {
                          handleQuestionChange(
                            qIndex,
                            "question",
                            e.target.value,
                          );
                        }}
                        rows={3}
                        placeholder="输入问题内容"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>选项</Label>
                      {(question.type === "single" ||
                        question.type === "truefalse") && (
                        <RadioGroup
                          value={
                            question.answer[0] !== undefined
                              ? String(question.answer[0])
                              : ""
                          }
                          onValueChange={(v) => {
                            handleAnswerChange(qIndex, Number(v));
                          }}
                          className="flex flex-col gap-2"
                        >
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <Input
                                value={option}
                                onChange={(e) => {
                                  handleOptionChange(
                                    qIndex,
                                    oIndex,
                                    e.target.value,
                                  );
                                }}
                                placeholder={`选项 ${String.fromCharCode(65 + oIndex)}`}
                                disabled={question.type === "truefalse"}
                                className="min-w-0 flex-1"
                              />
                              <div className="flex items-center gap-2">
                                <RadioGroupItem
                                  value={String(oIndex)}
                                  id={`eq-q${String(qIndex)}-opt${String(oIndex)}`}
                                />
                                <Label
                                  htmlFor={`eq-q${String(qIndex)}-opt${String(oIndex)}`}
                                  className="cursor-pointer text-sm font-normal"
                                >
                                  正确答案
                                </Label>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                      {question.type === "multiple" &&
                        question.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <Input
                              value={option}
                              onChange={(e) => {
                                handleOptionChange(
                                  qIndex,
                                  oIndex,
                                  e.target.value,
                                );
                              }}
                              placeholder={`选项 ${String.fromCharCode(65 + oIndex)}`}
                              className="min-w-0 flex-1"
                            />
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`eq-q${String(qIndex)}-opt${String(oIndex)}`}
                                checked={question.answer.includes(oIndex)}
                                onCheckedChange={() => {
                                  handleAnswerChange(qIndex, oIndex);
                                }}
                              />
                              <Label
                                htmlFor={`eq-q${String(qIndex)}-opt${String(oIndex)}`}
                                className="cursor-pointer text-sm font-normal"
                              >
                                正确答案
                              </Label>
                            </div>
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  handleRemoveOption(qIndex, oIndex);
                                }}
                              >
                                <Minus className="size-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      {question.type === "multiple" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleAddOption(qIndex);
                          }}
                        >
                          <Plus className="size-4" />
                          添加选项
                        </Button>
                      )}
                      {question.type === "truefalse" && (
                        <Alert>
                          <AlertTitle className="text-sm">
                            判断题固定为「正确」和「错误」两个选项
                          </AlertTitle>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAddQuestion}
              >
                <Plus className="size-4" />
                添加题目
              </Button>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate(-1)}
              >
                取消
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "保存中..." : "保存更改"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditQuiz;

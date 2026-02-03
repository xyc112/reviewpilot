import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, RotateCcw, XCircle } from "lucide-react";
import type { Quiz, QuizAttempt, AttemptResult } from "@/shared/types";
import { quizAPI, wrongQuestionAPI } from "@/shared/api";
import { useCourseStore } from "@/shared/stores";
import { useToast } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/shared/config/routes";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertTitle } from "@/shared/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { LoadingSpinner } from "@/shared/components";

const QuizDetail = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse ?? currentStudyingCourse;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const { success } = useToast();

  useEffect(() => {
    if (!course) {
      void navigate(ROUTES.COURSES);
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
      const currentAnswers = prev[questionId] ?? [];

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

      {
        const wrongQuestions: {
          questionEntityId: number;
          userAnswer: number[];
          questionId: string;
        }[] = [];
        response.data.results.forEach((result: AttemptResult) => {
          if (!result.correct && result.questionEntityId !== undefined) {
            const questionId = result.questionId;
            const userAnswer = answers[questionId] ?? [];
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
            console.error(
              "Failed to add wrong question:",
              getErrorMessage(err),
            );
          }
        }

        if (wrongQuestions.length > 0) {
          success(`已自动添加 ${String(wrongQuestions.length)} 道错题到错题本`);
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
  };

  if (!course) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertTitle>请先选择一个课程</AlertTitle>
            <div className="mt-2">
              <Button onClick={() => void navigate(ROUTES.COURSES)}>
                前往课程列表
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertTitle>测验不存在</AlertTitle>
          </Alert>
        </div>
      </div>
    );
  }

  if (attempt) {
    const scorePercentage = Math.round((attempt.score / attempt.total) * 100);
    const isPassed = scorePercentage >= 60;

    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto px-4 py-4">
          <div className="flex w-full flex-col gap-6">
            {/* 结果摘要 */}
            <Card
              className={
                isPassed
                  ? "border-0 bg-primary text-center text-primary-foreground"
                  : "border-0 bg-gradient-to-br from-pink-400 to-rose-500 text-center text-white"
              }
            >
              <CardContent className="flex flex-col gap-4 py-12">
                <div className="text-5xl">{isPassed ? "🎉" : "📝"}</div>
                <h2 className="text-2xl font-semibold">测验完成</h2>
                <div className="text-4xl font-bold">
                  {attempt.score} / {attempt.total}
                </div>
                <Badge
                  variant={isPassed ? "default" : "destructive"}
                  className="text-lg px-6 py-2 rounded-full"
                >
                  {String(scorePercentage)}%
                </Badge>
                <p className="text-lg">
                  {isPassed
                    ? "恭喜！您通过了本次测验"
                    : "还需要继续努力，建议重新学习相关内容"}
                </p>
              </CardContent>
            </Card>

            {/* 题目解析 */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">题目解析</h3>
                <div className="flex flex-col gap-6">
                  {quiz.questions.map((question, index) => {
                    const result = attempt.results.find(
                      (r) => r.questionId === question.id,
                    );
                    const userAnswer = answers[question.id] ?? [];
                    const isCorrect = result?.correct ?? false;
                    const correctAnswerIndices = question.answer ?? [];

                    return (
                      <Card
                        key={question.id}
                        className={
                          isCorrect
                            ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20"
                            : "border-2 border-red-500 bg-red-50 dark:bg-red-950/20"
                        }
                      >
                        <CardContent className="flex flex-col gap-4 pt-6">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">题目 {index + 1}</Badge>
                            <Badge
                              variant={isCorrect ? "default" : "destructive"}
                              className="gap-1"
                            >
                              {isCorrect ? (
                                <CheckCircle className="size-3.5" />
                              ) : (
                                <XCircle className="size-3.5" />
                              )}
                              {isCorrect ? "回答正确" : "回答错误"}
                            </Badge>
                          </div>

                          <h4 className="flex flex-wrap items-center gap-2 text-base font-medium">
                            {question.question}
                            {question.type === "multiple" && (
                              <Badge variant="secondary">多选</Badge>
                            )}
                            {question.type === "truefalse" && (
                              <Badge variant="outline">判断</Badge>
                            )}
                          </h4>

                          <div className="flex flex-col gap-2">
                            {(question.options ?? []).map(
                              (option, optIndex) => {
                                const isSelected =
                                  userAnswer.includes(optIndex);
                                const isCorrectAnswer =
                                  correctAnswerIndices.includes(optIndex);
                                const isCorrectlySelected =
                                  isSelected && isCorrectAnswer;
                                const isIncorrectlySelected =
                                  !isCorrect && isSelected && !isCorrectAnswer;

                                let cardClass =
                                  "rounded-md border-2 border-border bg-muted/30 p-3";
                                if (isCorrectlySelected) {
                                  cardClass =
                                    "rounded-md border-2 border-green-500 bg-green-50 dark:bg-green-950/20 p-3";
                                } else if (isIncorrectlySelected) {
                                  cardClass =
                                    "rounded-md border-2 border-red-500 bg-red-50 dark:bg-red-950/20 p-3";
                                } else if (!isSelected && isCorrectAnswer) {
                                  cardClass =
                                    "rounded-md border-2 border-dashed border-green-500 bg-green-50 dark:bg-green-950/20 p-3";
                                }

                                return (
                                  <div key={optIndex} className={cardClass}>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        {isCorrectlySelected ? (
                                          <CheckCircle className="size-5 text-green-600" />
                                        ) : isIncorrectlySelected ? (
                                          <XCircle className="size-5 text-red-600" />
                                        ) : isCorrectAnswer ? (
                                          <CheckCircle className="size-5 text-green-600" />
                                        ) : (
                                          <div className="size-4 rounded-full border-2 border-muted-foreground" />
                                        )}
                                        <span className="font-medium">
                                          {String.fromCharCode(65 + optIndex)}.
                                        </span>
                                        <span>{option}</span>
                                      </div>
                                      <div className="flex gap-1">
                                        {isSelected ? (
                                          <Badge
                                            variant={
                                              isCorrectlySelected
                                                ? "default"
                                                : "destructive"
                                            }
                                          >
                                            {isCorrectlySelected
                                              ? "你的答案（正确）"
                                              : "你的答案"}
                                          </Badge>
                                        ) : null}
                                        {!isSelected && isCorrectAnswer ? (
                                          <Badge variant="default">
                                            正确答案
                                          </Badge>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>

                          {question.explanation ? (
                            <Card className="border-l-4 border-l-primary bg-primary/10">
                              <CardContent className="p-4">
                                <p className="font-medium text-primary">
                                  📖 解析
                                </p>
                                <p className="mt-1 text-sm">
                                  {question.explanation}
                                </p>
                              </CardContent>
                            </Card>
                          ) : null}

                          <Separator />

                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              本题得分：
                            </span>
                            <span
                              className={
                                isCorrect
                                  ? "font-semibold text-green-600"
                                  : "font-semibold text-red-600"
                              }
                            >
                              {result?.score ?? 0} /{" "}
                              {Math.round(100 / quiz.questions.length) +
                                (index < 100 % quiz.questions.length ? 1 : 0)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                重新答题
              </Button>
              <Button onClick={() => void navigate(ROUTES.QUIZZES)}>
                <ArrowLeft className="size-4" />
                返回测验列表
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto px-4 py-4">
        <div className="flex w-full flex-col gap-6">
          {quiz.questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="flex flex-col gap-4 pt-6">
                <h4 className="flex flex-wrap items-center gap-2 text-base font-medium">
                  题目 {index + 1}
                </h4>
                <p className="flex flex-wrap items-center gap-2">
                  {question.question}
                  {question.type === "multiple" && (
                    <Badge variant="secondary">多选</Badge>
                  )}
                  {question.type === "truefalse" && (
                    <Badge variant="outline">判断</Badge>
                  )}
                </p>

                {question.type === "single" || question.type === "truefalse" ? (
                  <RadioGroup
                    value={
                      (answers[question.id] ?? []).length > 0
                        ? String((answers[question.id] ?? [])[0])
                        : ""
                    }
                    onValueChange={(v) => {
                      const val = Number(v);
                      handleOptionSelect(question.id, val, question.type);
                    }}
                    className="flex flex-col gap-3"
                  >
                    {(question.options ?? []).map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center gap-2 space-x-2"
                      >
                        <RadioGroupItem
                          value={String(optIndex)}
                          id={`q-${question.id}-${String(optIndex)}`}
                        />
                        <Label
                          htmlFor={`q-${question.id}-${String(optIndex)}`}
                          className="cursor-pointer font-normal"
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="flex flex-col gap-3">
                    {(question.options ?? []).map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center gap-2 space-x-2"
                      >
                        <Checkbox
                          id={`q-${question.id}-${String(optIndex)}`}
                          checked={(answers[question.id] ?? []).includes(
                            optIndex,
                          )}
                          onCheckedChange={(checked) => {
                            const current = answers[question.id] ?? [];
                            let arr: number[];
                            if (checked === true) {
                              arr = [...current, optIndex].sort(
                                (a, b) => a - b,
                              );
                            } else {
                              arr = current.filter((i) => i !== optIndex);
                            }
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: arr,
                            }));
                          }}
                        />
                        <Label
                          htmlFor={`q-${question.id}-${String(optIndex)}`}
                          className="cursor-pointer font-normal"
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={() => void handleSubmit()}
              disabled={submitting || Object.keys(answers).length === 0}
            >
              {submitting ? "提交中..." : "提交答案"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => void navigate(ROUTES.QUIZZES)}
            >
              <ArrowLeft className="size-4" />
              返回测验列表
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;

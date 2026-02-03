import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle, RotateCw, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "../components";
import type { WrongQuestion } from "../types";
import { wrongQuestionAPI } from "../services";
import { useCourseStore } from "../stores";
import {
  ConfirmDialog,
  useToast,
  SearchBox,
  ListEmptyState,
} from "../components";
import { getErrorMessage } from "../utils";

const WrongQuestionBook = () => {
  const navigate = useNavigate();
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const { success, error: showError } = useToast();

  const course = currentStudyingCourse ?? selectedCourse;
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
      void navigate("/courses");
      return;
    }
    void fetchWrongQuestions();
    void fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchWrongQuestions/fetchStats 依赖 course, filter
  }, [course, navigate, filter]);

  // 当错题列表更新时，重新获取统计信息
  useEffect(() => {
    if (course && !loading) {
      // 延迟一下，确保数据已更新
      const timer = setTimeout(() => {
        void fetchStats();
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchStats 依赖 course
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
    } catch (err: unknown) {
      setError("获取错题列表失败: " + getErrorMessage(err));
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
    } catch (err: unknown) {
      console.error("Failed to fetch stats:", getErrorMessage(err));
      setStats({ total: 0, mastered: 0, notMastered: 0 });
    }
  };

  const handleMarkAsMastered = async (wrongQuestionId: number) => {
    if (!course) return;
    try {
      await wrongQuestionAPI.markAsMastered(course.id, wrongQuestionId);
      success("已标记为已掌握");
      void fetchWrongQuestions();
      void fetchStats();
    } catch (err: unknown) {
      showError("标记失败: " + getErrorMessage(err));
    }
  };

  const handleRemove = async () => {
    if (!deleteConfirm || !course) return;
    try {
      await wrongQuestionAPI.removeWrongQuestion(course.id, deleteConfirm);
      success("已从错题本移除");
      setDeleteConfirm(null);
      void fetchWrongQuestions();
      void fetchStats();
    } catch (err: unknown) {
      showError("移除失败: " + getErrorMessage(err));
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
      const currentAnswers = prev[questionId] ?? [];
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
      const userAnswer = practiceAnswers[practicingQuestion.questionId] ?? [];
      const correctAnswer = practicingQuestion.question?.answer ?? [];
      const isCorrect =
        JSON.stringify([...userAnswer].sort()) ===
        JSON.stringify([...correctAnswer].sort());

      setShowPracticeResult({ [practicingQuestion.questionId]: true });

      if (isCorrect) {
        success("回答正确！");
      } else {
        showError("回答错误，请继续练习");
      }

      void fetchWrongQuestions();
    } catch (err: unknown) {
      showError("提交失败: " + getErrorMessage(err));
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
        (wq.question?.question ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [wrongQuestions, searchQuery]);

  if (!course) {
    return (
      <Alert className="mx-8 my-8">
        <AlertDescription>请先选择一个课程</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4">
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="移除错题"
        message="确定要从错题本中移除这道题吗？"
        confirmText="移除"
        cancelText="取消"
        type="danger"
        onConfirm={() => {
          void handleRemove();
        }}
        onCancel={() => {
          setDeleteConfirm(null);
        }}
      />

      {stats ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                总错题数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">{stats.total}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                未掌握
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold text-destructive">
                {stats.notMastered}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                已掌握
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold text-green-600 dark:text-green-500">
                {stats.mastered}
              </span>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setFilter("all");
          }}
        >
          全部
        </Button>
        <Button
          variant={filter === "notMastered" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setFilter("notMastered");
          }}
        >
          未掌握
        </Button>
        <Button
          variant={filter === "mastered" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setFilter("mastered");
          }}
        >
          已掌握
        </Button>
      </div>

      {/* 搜索栏 */}
      <SearchBox
        placeholder="搜索错题内容..."
        value={searchQuery}
        onChange={setSearchQuery}
        style={{ marginBottom: "2rem" }}
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {practicingQuestion?.question ? (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">练习错题</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClosePractice}
            >
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <h3 className="mb-2 text-base font-medium">
                {practicingQuestion.question.question}
                {practicingQuestion.question.type === "multiple" && (
                  <Badge variant="secondary" className="ml-2">
                    多选
                  </Badge>
                )}
                {practicingQuestion.question.type === "truefalse" && (
                  <Badge variant="outline" className="ml-2">
                    判断
                  </Badge>
                )}
              </h3>
            </div>

            {practicingQuestion.question.type === "single" ||
            practicingQuestion.question.type === "truefalse" ? (
              <RadioGroup
                value={
                  (practiceAnswers[practicingQuestion.questionId] ?? [])[0] !==
                  undefined
                    ? String(
                        (practiceAnswers[practicingQuestion.questionId] ??
                          [])[0],
                      )
                    : ""
                }
                onValueChange={(v) => {
                  if (!showPracticeResult[practicingQuestion.questionId]) {
                    const val = Number(v);
                    handlePracticeOptionSelect(
                      practicingQuestion.questionId,
                      val,
                      practicingQuestion.question.type,
                    );
                  }
                }}
                disabled={
                  showPracticeResult[practicingQuestion.questionId] ?? false
                }
                className="flex flex-col gap-2"
              >
                {practicingQuestion.question.options.map((option, optIndex) => {
                  const answers =
                    practiceAnswers[practicingQuestion.questionId] ?? [];
                  const isSelected = answers.includes(optIndex);
                  const showResult =
                    showPracticeResult[practicingQuestion.questionId];
                  const isCorrect =
                    practicingQuestion.question.answer.includes(optIndex);
                  const isCorrectlySelected = isSelected && isCorrect;
                  const isIncorrectlySelected = isSelected && !isCorrect;

                  return (
                    <div
                      key={optIndex}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border-2 p-3",
                        showResult &&
                          isCorrectlySelected &&
                          "border-green-500 bg-green-50 dark:bg-green-950/20",
                        showResult &&
                          isIncorrectlySelected &&
                          "border-red-500 bg-red-50 dark:bg-red-950/20",
                        showResult &&
                          !isSelected &&
                          isCorrect &&
                          "border-dashed border-green-500 bg-green-50 dark:bg-green-950/20",
                      )}
                    >
                      <RadioGroupItem
                        value={String(optIndex)}
                        id={`practice-${String(practicingQuestion.questionId)}-${String(optIndex)}`}
                      />
                      <Label
                        htmlFor={`practice-${String(practicingQuestion.questionId)}-${String(optIndex)}`}
                        className="flex flex-1 cursor-pointer items-center gap-2 font-medium"
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {showResult ? (
                          <span className="ml-2 flex gap-1">
                            {isCorrectlySelected ? (
                              <Badge variant="default" className="bg-green-600">
                                你的答案（正确）
                              </Badge>
                            ) : null}
                            {isIncorrectlySelected ? (
                              <Badge variant="destructive">你的答案</Badge>
                            ) : null}
                            {!isSelected && isCorrect ? (
                              <Badge variant="default" className="bg-green-600">
                                正确答案
                              </Badge>
                            ) : null}
                          </span>
                        ) : null}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="flex flex-col gap-2">
                {practicingQuestion.question.options.map((option, optIndex) => {
                  const answers =
                    practiceAnswers[practicingQuestion.questionId] ?? [];
                  const isSelected = answers.includes(optIndex);
                  const showResult =
                    showPracticeResult[practicingQuestion.questionId];
                  const isCorrect =
                    practicingQuestion.question.answer.includes(optIndex);
                  const isCorrectlySelected = isSelected && isCorrect;
                  const isIncorrectlySelected = isSelected && !isCorrect;

                  return (
                    <div
                      key={optIndex}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border-2 p-3",
                        showResult &&
                          isCorrectlySelected &&
                          "border-green-500 bg-green-50 dark:bg-green-950/20",
                        showResult &&
                          isIncorrectlySelected &&
                          "border-red-500 bg-red-50 dark:bg-red-950/20",
                        showResult &&
                          !isSelected &&
                          isCorrect &&
                          "border-dashed border-green-500 bg-green-50 dark:bg-green-950/20",
                      )}
                    >
                      <Checkbox
                        id={`practice-cb-${String(practicingQuestion.questionId)}-${String(optIndex)}`}
                        checked={isSelected}
                        disabled={
                          showPracticeResult[practicingQuestion.questionId] ??
                          false
                        }
                        onCheckedChange={(checked) => {
                          if (
                            !showPracticeResult[practicingQuestion.questionId]
                          ) {
                            const current =
                              practiceAnswers[practicingQuestion.questionId] ??
                              [];
                            const newAnswers: number[] =
                              checked === true
                                ? [...current, optIndex].sort((a, b) => a - b)
                                : current.filter((i) => i !== optIndex);
                            setPracticeAnswers((prev) => ({
                              ...prev,
                              [practicingQuestion.questionId]: newAnswers,
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`practice-cb-${String(practicingQuestion.questionId)}-${String(optIndex)}`}
                        className="flex flex-1 cursor-pointer items-center gap-2 font-medium"
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {showResult ? (
                          <span className="ml-2 flex gap-1">
                            {isCorrectlySelected ? (
                              <Badge variant="default" className="bg-green-600">
                                你的答案（正确）
                              </Badge>
                            ) : null}
                            {isIncorrectlySelected ? (
                              <Badge variant="destructive">你的答案</Badge>
                            ) : null}
                            {!isSelected && isCorrect ? (
                              <Badge variant="default" className="bg-green-600">
                                正确答案
                              </Badge>
                            ) : null}
                          </span>
                        ) : null}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {showPracticeResult[practicingQuestion.questionId] ? (
              <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        正确答案：
                      </span>
                      <span className="font-medium">
                        {practicingQuestion.question.answer
                          ?.map((idx) => String.fromCharCode(65 + idx))
                          .join(", ")}
                      </span>
                    </div>
                    {practicingQuestion.question.explanation ? (
                      <>
                        <Separator className="my-2" />
                        <div>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            解析：
                          </span>
                          <p className="mt-1 text-sm">
                            {practicingQuestion.question.explanation}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="flex gap-2">
              {!showPracticeResult[practicingQuestion.questionId] ? (
                <Button
                  onClick={() => {
                    void handleSubmitPractice();
                  }}
                >
                  提交答案
                </Button>
              ) : (
                <Button variant="outline" onClick={handleClosePractice}>
                  关闭
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-4">
        {wrongQuestions.length === 0 ? (
          <ListEmptyState
            variant="empty"
            icon={<BookOpen className="size-16 text-muted-foreground" />}
            description={
              <div className="flex flex-col gap-1 text-center">
                <h3 className="text-lg font-semibold">暂无错题</h3>
                <span className="text-sm text-muted-foreground">
                  {filter === "mastered"
                    ? "暂无已掌握的错题"
                    : filter === "notMastered"
                      ? "暂无未掌握的错题"
                      : "完成测验后，错题会自动添加到错题本"}
                </span>
              </div>
            }
          />
        ) : filteredWrongQuestions.length === 0 && searchQuery ? (
          <ListEmptyState
            variant="noResults"
            icon={<BookOpen className="size-16 text-muted-foreground" />}
            description={
              <div className="flex flex-col gap-1 text-center">
                <h3 className="text-lg font-semibold">未找到匹配的错题</h3>
                <span className="text-sm text-muted-foreground">
                  尝试调整搜索条件
                </span>
              </div>
            }
            onClearFilter={() => {
              setSearchQuery("");
            }}
            clearFilterLabel="清除搜索"
          />
        ) : filteredWrongQuestions.length > 0 ? (
          filteredWrongQuestions.map((wq) => (
            <Card key={wq.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 font-medium">
                        {wq.question?.question ?? "题目加载中..."}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>来自测验: {wq.quizId}</span>
                        <span>练习次数: {String(wq.practiceCount)}</span>
                        <span>
                          添加时间:{" "}
                          {new Date(wq.addedAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={wq.mastered ? "default" : "secondary"}
                      className={
                        wq.mastered ? "bg-green-600" : "bg-amber-500 text-white"
                      }
                    >
                      {wq.mastered ? "已掌握" : "未掌握"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        handleStartPractice(wq);
                      }}
                    >
                      <RotateCw className="mr-1 size-4" />
                      重新练习
                    </Button>
                    {!wq.mastered && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void handleMarkAsMastered(wq.id);
                        }}
                      >
                        <CheckCircle className="mr-1 size-4" />
                        标记为已掌握
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeleteConfirm(wq.id);
                      }}
                    >
                      <Trash2 className="mr-1 size-4" />
                      移除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>
    </div>
  );
};

export default WrongQuestionBook;

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import type { Quiz } from "../types";
import { quizAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import {
  ConfirmDialog,
  useToast,
  SearchBox,
  ListEmptyState,
  ListItemCard,
  LoadingSpinner,
} from "../components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getErrorMessage } from "../utils";

const QuizList = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse ?? currentStudyingCourse;
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    quizId: string | null;
  }>({
    isOpen: false,
    quizId: null,
  });

  useEffect(() => {
    if (!course) {
      void navigate("/courses");
      return;
    }
    void fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchQuizzes 依赖 course
  }, [course, navigate]);

  const fetchQuizzes = async () => {
    if (!course) return;
    try {
      const response = await quizAPI.getQuizzes(course.id);
      setQuizzes(response.data);
    } catch {
      setError("获取测验列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (quizId: string) => {
    setDeleteConfirm({ isOpen: true, quizId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.quizId) return;
    if (!course) return;
    try {
      await quizAPI.deleteQuiz(course.id, deleteConfirm.quizId);
      success("测验删除成功");
      void fetchQuizzes();
    } catch (err: unknown) {
      const errorMsg = "删除测验失败: " + (getErrorMessage(err) || "未知错误");
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setDeleteConfirm({ isOpen: false, quizId: null });
    }
  };

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      const matchesSearch =
        !searchQuery ||
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [quizzes, searchQuery]);

  if (!course) {
    return (
      <Alert className="mx-8 my-8">
        <AlertDescription>请先选择一个课程</AlertDescription>
        <Button className="mt-4" onClick={() => void navigate("/courses")}>
          前往课程列表
        </Button>
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

  if (error) {
    return (
      <Alert variant="destructive" className="mx-8 my-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4">
      <div className="mb-6 flex w-full flex-col gap-4">
        {isAdmin ? (
          <div className="flex justify-end">
            <Link to="/quizzes/new">
              <Button>
                <Plus className="size-4" />
                创建测验
              </Button>
            </Link>
          </div>
        ) : null}
        <SearchBox
          placeholder="搜索测验标题..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除测验"
        message="确定要删除这个测验吗？此操作无法撤销，将删除测验及其所有相关数据。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          setDeleteConfirm({ isOpen: false, quizId: null });
        }}
      />

      {quizzes.length === 0 ? (
        <ListEmptyState
          variant="empty"
          icon={<FileText className="size-16 text-muted-foreground" />}
          description={
            <span>
              暂无测验
              <br />
              <span className="text-muted-foreground">
                {isAdmin ? "立即创建第一个测验吧！" : "请等待管理员创建测验。"}
              </span>
            </span>
          }
          action={
            isAdmin ? (
              <Link to="/quizzes/new">
                <Button>
                  <Plus className="size-4" />
                  创建新测验
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : filteredQuizzes.length === 0 ? (
        <ListEmptyState
          variant="noResults"
          description={
            <span>
              未找到匹配的测验
              <br />
              <span className="text-muted-foreground">尝试调整搜索条件</span>
            </span>
          }
          onClearFilter={() => {
            setSearchQuery("");
          }}
          clearFilterLabel="清除搜索"
        />
      ) : (
        <div className="space-y-0">
          {filteredQuizzes.map((quiz) => (
            <ListItemCard key={quiz.id}>
              <div className="flex w-full flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="m-0 text-lg font-semibold text-foreground">
                      {quiz.title}
                    </h4>
                    <Badge variant="secondary">
                      {quiz.questions.length} 题
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    包含 {quiz.questions.length}{" "}
                    道题目，测试您对课程知识的掌握程度
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to={`/quizzes/${quiz.id}`}>
                    <Button size="sm">开始测验</Button>
                  </Link>
                  {isAdmin ? (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          void navigate(`/quizzes/edit/${quiz.id}`)
                        }
                        title="编辑测验"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          handleDelete(quiz.id);
                        }}
                        title="删除测验"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </ListItemCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;

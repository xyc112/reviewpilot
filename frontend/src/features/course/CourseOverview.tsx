import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BarChart2,
  Book,
  Calendar,
  FileText,
  List,
  MessageCircle,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertTitle } from "@/shared/components/ui/alert";
import { LoadingSpinner } from "@/shared/components";
import type { Course } from "@/shared/types";
import { courseAPI, noteAPI, quizAPI, postAPI } from "@/shared/api";
import { useAuthStore, useCourseStore } from "@/shared/stores";
import { ConfirmDialog, useToast } from "@/shared/components";
import { getErrorMessage, normalizeNewlines } from "@/shared/utils";
import { ROUTES } from "@/shared/config/routes";

const CourseOverview = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const { success, error: showError } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState<{
    noteCount: number;
    quizCount: number;
    postCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      void fetchCourseData(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchCourseData 依赖 id
  }, [id]);

  const fetchCourseData = async (courseId: number) => {
    try {
      setLoading(true);
      const courseRes = await courseAPI.getCourse(courseId);
      setCourse(courseRes.data);

      try {
        const [notesRes, quizzesRes, postsRes] = await Promise.all([
          noteAPI.getNotes(courseId).catch(() => ({ data: [] })),
          quizAPI.getQuizzes(courseId).catch(() => ({ data: [] })),
          postAPI.getPosts(courseId).catch(() => ({ data: [] })),
        ]);

        setStats({
          noteCount: notesRes.data.length,
          quizCount: quizzesRes.data.length,
          postCount: postsRes.data.length,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    } catch (err: unknown) {
      setError("获取课程信息失败");
      showError("获取课程信息失败: " + getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!course) return;
    try {
      await courseAPI.deleteCourse(course.id);
      success("课程删除成功");
      window.location.href = ROUTES.COURSES;
    } catch (err: unknown) {
      const errorMsg = "删除课程失败: " + (getErrorMessage(err) || "无权限");
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setDeleteConfirm(false);
    }
  };

  const getLevelText = (level: string) => {
    const levels = {
      BEGINNER: "初级",
      INTERMEDIATE: "中级",
      ADVANCED: "高级",
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getLevelColor = (
    level: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    const map: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      BEGINNER: "default",
      INTERMEDIATE: "secondary",
      ADVANCED: "destructive",
    };
    return map[level] ?? "outline";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>课程不存在</AlertTitle>
        </Alert>
      </div>
    );
  }

  const canEdit = isAdmin || user?.id === course.authorId;
  const isCurrentCourse = currentStudyingCourse?.id === course.id;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1000px] flex flex-col overflow-auto px-4">
        <ConfirmDialog
          isOpen={deleteConfirm}
          title="删除课程"
          message="确定要删除这个课程吗？此操作不可撤销，将删除课程及其所有相关内容（笔记、测验、知识图谱等）。"
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={() => {
            void confirmDelete();
          }}
          onCancel={() => {
            setDeleteConfirm(false);
          }}
        />

        <div className="flex w-full flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {isCurrentCourse ? (
                  <Badge variant="secondary" className="gap-1">
                    <Book className="size-3" />
                    当前学习课程
                  </Badge>
                ) : (
                  <span />
                )}
                {canEdit ? (
                  <div className="flex gap-2">
                    <Link to={ROUTES.EDIT_COURSE(course.id)}>
                      <Button variant="outline">
                        <Pencil className="size-4" />
                        编辑课程
                      </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleDelete}>
                      <Trash2 className="size-4" />
                      删除课程
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="size-4 text-muted-foreground" />
                  <Badge variant={getLevelColor(course.level)}>
                    {getLevelText(course.level)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
                {course.authorId ? (
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      作者 ID: {course.authorId}
                    </span>
                  </div>
                ) : null}
              </div>

              <div>
                <h2 className="mb-2 text-lg font-semibold">课程简介</h2>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {normalizeNewlines(course.description || "暂无描述")}
                </p>
              </div>

              {course.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {/* 统计信息卡片 */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="flex items-center gap-3 pt-6">
                    <FileText className="size-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">笔记数量</p>
                      <p className="text-2xl font-semibold">
                        {stats?.noteCount ?? 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 pt-6">
                    <List className="size-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">测验数量</p>
                      <p className="text-2xl font-semibold">
                        {stats?.quizCount ?? 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 pt-6">
                    <MessageCircle className="size-8 text-violet-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">帖子数量</p>
                      <p className="text-2xl font-semibold">
                        {stats?.postCount ?? 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;

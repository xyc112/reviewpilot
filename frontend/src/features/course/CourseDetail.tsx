import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart2,
  Calendar,
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
import { courseAPI } from "@/shared/api";
import { useAuthStore } from "@/shared/stores";
import { ConfirmDialog, useToast } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/shared/config/routes";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      void fetchCourse(Number(id));
    }
  }, [id]);

  const fetchCourse = async (courseId: number) => {
    try {
      const response = await courseAPI.getCourse(courseId);
      setCourse(response.data);
    } catch {
      setError("获取课程详情失败");
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
      void navigate(ROUTES.COURSES);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error)
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </div>
    );

  if (!course)
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>课程不存在</AlertTitle>
        </Alert>
      </div>
    );

  const canEdit = isAdmin || user?.id === course.authorId;

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

  return (
    <div className="mx-auto max-w-[1200px] px-4">
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
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => {
            void navigate(ROUTES.COURSES);
          }}
        >
          <ArrowLeft className="size-4" />
          返回课程列表
        </Button>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="flex flex-col gap-6 pt-6">
            {canEdit ? (
              <div className="flex justify-end gap-2">
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
              <p className="text-muted-foreground">
                {course.description || "暂无描述"}
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

            <div className="h-px w-full bg-border" />

            <Link to={ROUTES.COURSE_COMMUNITY(course.id)}>
              <Button>
                <MessageCircle className="size-4" />
                进入课程社区
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetail;

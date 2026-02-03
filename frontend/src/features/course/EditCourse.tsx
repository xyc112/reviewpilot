import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Course } from "@/shared/types";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Alert, AlertTitle } from "@/shared/components/ui/alert";
import { LoadingSpinner } from "@/shared/components";
import { courseAPI } from "@/shared/api";
import { useAuthStore } from "@/shared/stores";
import { useToast } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/shared/config/routes";

const EditCourse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    level: "BEGINNER",
  });

  useEffect(() => {
    if (id) {
      void fetchCourse(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchCourse 依赖 id
  }, [id]);

  const fetchCourse = async (courseId: number) => {
    try {
      const response = await courseAPI.getCourse(courseId);
      const courseData = response.data;
      setCourse(courseData);
      setForm({
        title: courseData.title,
        description: courseData.description || "",
        tags: courseData.tags.join(", "),
        level: courseData.level,
      });
    } catch {
      setError("获取课程详情失败");
      showError("获取课程详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!course) return;

    setSaving(true);
    setError("");

    try {
      const courseData = {
        title: form.title,
        description: form.description || "",
        tags: form.tags
          ? form.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        level: form.level,
      };

      await courseAPI.updateCourse(course.id, courseData);
      success("课程更新成功");
      void navigate(ROUTES.COURSE_DETAIL(course.id));
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "更新课程失败";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error && !course) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>课程不存在</AlertTitle>
        </Alert>
      </div>
    );
  }

  const canEdit = isAdmin || user?.id === course.authorId;

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>无权限编辑此课程</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] px-4">
      <Card className="rounded-xl shadow-sm">
        <CardContent className="pt-6">
          <h1 className="mb-6 text-2xl font-semibold">编辑课程</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(e);
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">课程标题</Label>
              <Input
                id="title"
                placeholder="请输入课程标题"
                value={form.title}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, title: e.target.value }));
                }}
                maxLength={100}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">课程描述</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="请输入课程描述"
                value={form.description}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                }}
                maxLength={500}
                className="resize-none"
              />
              <span className="text-xs text-muted-foreground">
                {form.description.length}/500
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">标签</Label>
              <Input
                id="tags"
                placeholder="例如: 数学, 基础, 入门"
                value={form.tags}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, tags: e.target.value }));
                }}
              />
              <span className="text-xs text-muted-foreground">
                多个标签请用逗号分隔
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label>难度等级</Label>
              <Select
                value={form.level}
                onValueChange={(value) => {
                  setForm((prev) => ({ ...prev, level: value }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择难度等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">初级</SelectItem>
                  <SelectItem value="INTERMEDIATE">中级</SelectItem>
                  <SelectItem value="ADVANCED">高级</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <Alert variant="destructive" className="mb-2">
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            ) : null}

            <div className="mt-6 flex gap-2">
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

export default EditCourse;

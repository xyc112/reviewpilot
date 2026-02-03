import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, X } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertTitle } from "@/shared/components/ui/alert";
import { postAPI } from "@/shared/api";
import { useCourseStore } from "@/shared/stores";
import { useToast } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/shared/config/routes";

const CreatePost = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const courseId =
    courseIdParam ??
    (currentStudyingCourse != null
      ? String(currentStudyingCourse.id)
      : undefined) ??
    (selectedCourse != null ? String(selectedCourse.id) : undefined);
  const { success, error: showError } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) {
      void navigate(ROUTES.COURSES);
    }
  }, [courseId, navigate]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!courseId || !title.trim() || !content.trim()) {
      setError("请填写标题和内容");
      showError("请填写标题和内容");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await postAPI.createPost(Number(courseId), {
        title: title.trim(),
        content: content.trim(),
      });
      success("帖子发布成功");
      void navigate(ROUTES.COURSE_COMMUNITY(Number(courseId)));
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!courseId) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[800px] flex-1 overflow-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertTitle>请先选择课程</AlertTitle>
            <Button
              className="mt-2"
              onClick={() => void navigate(ROUTES.COURSES)}
            >
              前往课程列表
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[800px] flex-1 overflow-auto px-4 py-4">
        <Button
          variant="outline"
          className="mb-4 w-fit"
          onClick={() => {
            void navigate(ROUTES.COURSE_COMMUNITY(Number(courseId)));
          }}
        >
          <ArrowLeft className="size-4" />
          返回社区
        </Button>

        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : null}

        <Card>
          <CardContent className="pt-6">
            <h1 className="mb-6 text-2xl font-semibold">发布新帖</h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit(e);
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="post-title">标题</Label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  placeholder="输入帖子标题"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="post-content">内容</Label>
                <Textarea
                  id="post-content"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                  }}
                  placeholder="输入帖子内容，支持 Markdown 格式"
                  rows={12}
                  className="resize-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void navigate(ROUTES.COURSE_COMMUNITY(Number(courseId)));
                  }}
                  disabled={saving}
                >
                  <X className="size-4" />
                  取消
                </Button>
                <Button type="submit" disabled={saving}>
                  <Send className="size-4" />
                  {saving ? "发布中..." : "发布"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;

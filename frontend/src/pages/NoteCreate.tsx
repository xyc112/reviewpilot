import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { noteAPI } from "../services";
import { useCourseStore } from "../stores";
import { useToast } from "../components";
import { getErrorMessage } from "../utils";
import { ROUTES } from "@/routes";

const NoteCreate = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse ?? currentStudyingCourse;
  const { success, error: showError } = useToast();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    summary: "",
    visibility: "private" as "public" | "private",
  });

  useEffect(() => {
    if (!course) {
      void navigate(ROUTES.COURSES);
    }
  }, [course, navigate]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!course) return;

    setSaving(true);
    setError("");

    try {
      const response = await noteAPI.createNote(course.id, noteForm);
      success("笔记创建成功");
      void navigate(ROUTES.NOTE_DETAIL(response.data.id));
    } catch (err: unknown) {
      const errorMsg = "创建笔记失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!course) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>请先选择一个课程</AlertTitle>
          <div className="mt-2">
            <Button onClick={() => void navigate(ROUTES.COURSES)}>
              前往课程列表
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4">
      <div className="flex flex-col gap-6">
        <Button
          variant="outline"
          className="w-fit"
          onClick={() => void navigate(ROUTES.NOTES)}
        >
          <ArrowLeft className="size-4" />
          返回笔记列表
        </Button>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : null}

        <Card>
          <CardContent className="pt-6">
            <h1 className="mb-6 text-2xl font-semibold">创建新笔记</h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit(e);
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  value={noteForm.title}
                  onChange={(e) => {
                    setNoteForm({ ...noteForm, title: e.target.value });
                  }}
                  placeholder="输入笔记标题"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="summary">摘要</Label>
                <Textarea
                  id="summary"
                  rows={3}
                  value={noteForm.summary}
                  onChange={(e) => {
                    setNoteForm({ ...noteForm, summary: e.target.value });
                  }}
                  placeholder="输入笔记摘要（可选，用于列表预览，建议50-150字）"
                  className="resize-none"
                />
                <span className="text-xs text-muted-foreground">
                  摘要将显示在笔记列表中，如果不填写，将自动截取内容前150字作为预览
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  rows={20}
                  value={noteForm.content}
                  onChange={(e) => {
                    setNoteForm({ ...noteForm, content: e.target.value });
                  }}
                  placeholder="输入笔记内容，支持 Markdown 格式"
                  className="resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>可见性</Label>
                <Select
                  value={noteForm.visibility}
                  onValueChange={(value: "public" | "private") => {
                    setNoteForm({ ...noteForm, visibility: value });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">私有（仅自己可见）</SelectItem>
                    <SelectItem value="public">公开（所有人可见）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void navigate(ROUTES.NOTES)}
                  disabled={saving}
                >
                  <X className="size-4" />
                  取消
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="size-4" />
                  {saving ? "创建中..." : "创建"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoteCreate;

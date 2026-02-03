import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import type { Note } from "../types";
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
import LoadingSpinner from "@/components/LoadingSpinner";
import { noteAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import { useToast } from "../components";
import { getErrorMessage } from "../utils";

const NoteEdit = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse ?? currentStudyingCourse;
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
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
      void navigate("/courses");
      return;
    }
    if (noteId) {
      void fetchNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchNote 依赖 course, noteId
  }, [course, noteId, navigate]);

  const fetchNote = async () => {
    if (!course || !noteId) return;
    try {
      setLoading(true);
      const response = await noteAPI.getNote(course.id, noteId);
      const noteData = response.data;
      setNote(noteData);
      setNoteForm({
        title: noteData.title,
        content: noteData.content,
        summary: noteData.summary ?? "",
        visibility: noteData.visibility,
      });
    } catch (err: unknown) {
      const errorMsg = "获取笔记失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!note || !course) return;

    setSaving(true);
    setError("");

    try {
      await noteAPI.updateNote(course.id, note.id, noteForm);
      success("笔记更新成功");
      void navigate(`/notes/${noteId ?? ""}`);
    } catch (err: unknown) {
      const errorMsg = "更新笔记失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const canEdit = () => {
    return isAdmin || note?.authorId === user?.id;
  };

  if (!course) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-8">
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

  if (loading) return <LoadingSpinner />;

  if (error && !note) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>笔记不存在</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (!canEdit()) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>无权限编辑此笔记</AlertTitle>
          <div className="mt-2">
            <Button onClick={() => void navigate("/notes")}>
              返回笔记列表
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
          onClick={() => void navigate(`/notes/${noteId ?? ""}`)}
        >
          <ArrowLeft className="size-4" />
          取消编辑
        </Button>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        ) : null}

        <Card>
          <CardContent className="pt-6">
            <h1 className="mb-6 text-2xl font-semibold">编辑笔记</h1>
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
                  onClick={() => void navigate(`/notes/${String(noteId)}`)}
                  disabled={saving}
                >
                  <X className="size-4" />
                  取消
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="size-4" />
                  {saving ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoteEdit;

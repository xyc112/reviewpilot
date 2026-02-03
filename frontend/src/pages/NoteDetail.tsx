import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import type { Note } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components";
import { noteAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import { MarkdownRenderer, ConfirmDialog, useToast } from "../components";
import { getErrorMessage } from "../utils";
import { ROUTES } from "@/routes";

const NoteDetail = () => {
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
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!course) {
      void navigate(ROUTES.COURSES);
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
      setNote(response.data);
    } catch (err: unknown) {
      const errorMsg = "获取笔记失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !course) return;
    try {
      await noteAPI.deleteNote(course.id, note.id);
      success("笔记删除成功");
      void navigate(ROUTES.NOTES);
    } catch (err: unknown) {
      const errorMsg = "删除笔记失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setDeleteConfirm(false);
    }
  };

  const canEdit = () => {
    return isAdmin || note?.authorId === user?.id;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (loading) return <LoadingSpinner />;

  if (error) {
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

  return (
    <div className="mx-auto max-w-[900px] px-4">
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="删除笔记"
        message="确定要删除这条笔记吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => {
          setDeleteConfirm(false);
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => void navigate(ROUTES.NOTES)}
          >
            <ArrowLeft className="size-4" />
            返回笔记列表
          </Button>
          {canEdit() && (
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  noteId && void navigate(ROUTES.NOTE_EDIT(noteId))
                }
              >
                <Pencil className="size-4" />
                编辑笔记
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteConfirm(true);
                }}
              >
                <Trash2 className="size-4" />
                删除笔记
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h1 className="text-2xl font-bold">{note.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={note.visibility === "public" ? "default" : "secondary"}
              >
                {note.visibility === "public" ? "公开" : "私有"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                创建于: {formatDate(note.createdAt)}
              </span>
              {note.updatedAt ? (
                <span className="text-sm text-muted-foreground">
                  更新于: {formatDate(note.updatedAt)}
                </span>
              ) : null}
            </div>
            <Separator />
            <div className="min-h-[400px]">
              <MarkdownRenderer content={note.content} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NoteDetail;

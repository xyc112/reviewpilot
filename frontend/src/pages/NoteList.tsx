import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FileText, Trash2 } from "lucide-react";
import type { Note } from "../types";
import { noteAPI } from "../services";
import { useCourseStore } from "../stores";
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
import { ROUTES } from "@/routes";

const NoteList = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse ?? currentStudyingCourse;

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    noteId: string | null;
  }>({
    isOpen: false,
    noteId: null,
  });

  const { success, error: showError } = useToast();

  useEffect(() => {
    if (!course) {
      void navigate(ROUTES.COURSES);
      return;
    }
    void fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchNotes 依赖 course
  }, [course, navigate]);

  const fetchNotes = async () => {
    if (!course) return;
    try {
      setLoading(true);
      const response = await noteAPI.getNotes(course.id);
      setNotes(response.data);
    } catch (err: unknown) {
      setError("获取笔记列表失败: " + getErrorMessage(err));
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setDeleteConfirm({ isOpen: true, noteId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.noteId) return;
    if (!course) return;
    try {
      await noteAPI.deleteNote(course.id, deleteConfirm.noteId);
      success("笔记删除成功");
      void fetchNotes();
    } catch (err: unknown) {
      const errorMsg = "删除笔记失败: " + getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setDeleteConfirm({ isOpen: false, noteId: null });
    }
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

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [notes, searchQuery]);

  if (!course) {
    return (
      <Alert className="mx-8 my-8">
        <AlertDescription>请先选择一个课程</AlertDescription>
        <Button
          className="mt-4"
          onClick={() => {
            void navigate(ROUTES.COURSES);
          }}
        >
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

  return (
    <div className="mx-auto max-w-[1200px] px-4">
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1">
          <SearchBox
            placeholder="搜索笔记标题或内容..."
            value={searchQuery}
            onChange={setSearchQuery}
            maxWidth={undefined}
            style={{ flex: 1 }}
          />
        </div>
        <Link to={ROUTES.CREATE_NOTE} className="shrink-0">
          <Button>
            <Plus className="size-4" />
            创建笔记
          </Button>
        </Link>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除笔记"
        message="确定要删除这条笔记吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={() => {
          void confirmDelete();
        }}
        onCancel={() => {
          setDeleteConfirm({ isOpen: false, noteId: null });
        }}
      />

      {notes.length === 0 ? (
        <ListEmptyState
          variant="empty"
          icon={<FileText className="size-16 text-muted-foreground" />}
          description={
            <span>
              暂无笔记
              <br />
              <span className="text-muted-foreground">
                点击「创建笔记」按钮开始记录你的学习心得
              </span>
            </span>
          }
          action={
            <Link to={ROUTES.CREATE_NOTE}>
              <Button>
                <Plus className="size-4" />
                创建笔记
              </Button>
            </Link>
          }
        />
      ) : filteredNotes.length === 0 ? (
        <ListEmptyState
          variant="noResults"
          description={
            <span>
              未找到匹配的笔记
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
          {filteredNotes.map((note) => (
            <ListItemCard key={note.id}>
              <div className="flex w-full items-start gap-4">
                <Link
                  to={ROUTES.NOTE_DETAIL(note.id)}
                  className="min-w-0 flex-1 no-underline text-foreground hover:text-foreground"
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="m-0 text-lg font-semibold text-foreground">
                        {note.title}
                      </h4>
                      <Badge
                        variant={
                          note.visibility === "public" ? "default" : "secondary"
                        }
                      >
                        {note.visibility === "public" ? "公开" : "私有"}
                      </Badge>
                    </div>
                    <p className="m-0 line-clamp-2 text-sm text-muted-foreground">
                      {note.summary ??
                        (note.content.length > 150
                          ? note.content.substring(0, 150) + "..."
                          : note.content
                        ).replace(/\n/g, " ")}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  aria-label="删除笔记"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </ListItemCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteList;

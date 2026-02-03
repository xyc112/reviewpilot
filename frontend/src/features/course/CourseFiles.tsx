import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { LoadingSpinner, ConfirmDialog, useToast } from "@/shared/components";
import { courseAPI, courseFileAPI } from "@/shared/api";
import type { CourseFileItem } from "@/shared/api/courseFile";
import { useAuthStore } from "@/shared/stores";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/shared/config/routes";

const CourseFiles = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();
  const [courseTitle, setCourseTitle] = useState("");
  const [files, setFiles] = useState<CourseFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileDeleteId, setFileDeleteId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const courseId = id ? Number(id) : 0;

  useEffect(() => {
    if (courseId > 0) {
      void loadCourseAndFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadCourseAndFiles depends on courseId only
  }, [courseId]);

  const loadCourseAndFiles = async () => {
    setLoading(true);
    try {
      const [courseRes, filesRes] = await Promise.all([
        courseAPI.getCourse(courseId),
        courseFileAPI.list(courseId),
      ]);
      setCourseTitle(courseRes.data.title);
      setFiles(Array.isArray(filesRes.data) ? filesRes.data : []);
    } catch {
      setCourseTitle("");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      await courseFileAPI.upload(courseId, file);
      success("上传成功");
      void loadCourseAndFiles();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: number) => {
    try {
      const url = await courseFileAPI.getDownloadBlobUrl(courseId, fileId);
      const name = files.find((f) => f.id === fileId)?.filename ?? "file";
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (fileDeleteId == null) return;
    try {
      await courseFileAPI.delete(courseId, fileDeleteId);
      success("已删除");
      void loadCourseAndFiles();
    } catch (err: unknown) {
      showError(getErrorMessage(err));
    } finally {
      setFileDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1000px] flex h-full min-h-0 flex-col overflow-hidden px-4">
        <div className="mb-5 flex shrink-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigate(ROUTES.COURSES);
              }}
            >
              <ArrowLeft className="size-4" />
              返回
            </Button>
            <h1 className="truncate text-lg font-semibold text-foreground">
              {courseTitle || "课程资料"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              className="sr-only"
              onChange={(e) => {
                void handleUpload(e);
              }}
              aria-label="上传文件"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="size-4" />
              {uploading ? "上传中…" : "上传"}
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {files.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              暂无文件，支持图片或 PDF，单文件最大 10MB
            </p>
          ) : (
            <ul className="space-y-2">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-xl border border-border/80 bg-card px-4 py-3"
                >
                  <span
                    className="min-w-0 flex-1 truncate text-base"
                    title={f.filename}
                  >
                    {f.filename}
                  </span>
                  <div className="ml-3 flex shrink-0 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void handleDownload(f.id);
                      }}
                    >
                      <Download className="size-4" />
                      下载
                    </Button>
                    {f.uploadedBy === user?.id || isAdmin ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setFileDeleteId(f.id);
                        }}
                      >
                        <Trash2 className="size-4" />
                        删除
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ConfirmDialog
          isOpen={fileDeleteId != null}
          title="删除文件"
          message="确定要删除该文件吗？"
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={() => {
            void confirmDelete();
          }}
          onCancel={() => {
            setFileDeleteId(null);
          }}
        />
      </div>
    </div>
  );
};

export default CourseFiles;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Alert,
  Spin,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Note } from "../types";
import { noteAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import {
  MarkdownRenderer,
  ConfirmDialog,
  useToast,
} from "../components";
import { getErrorMessage } from "../utils";

const { Title, Text } = Typography;

const NoteDetail = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse || currentStudyingCourse;
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { success, error: showError } = useToast();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!course) {
      navigate("/courses");
      return;
    }
    if (noteId) {
      fetchNote();
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
    if (!note) return;
    if (!course) return;
    try {
      await noteAPI.deleteNote(course.id, note.id);
      success("笔记删除成功");
      navigate("/notes");
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
      <Alert
        message="请先选择一个课程"
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={() => navigate("/courses")}>
            前往课程列表
          </Button>
        }
        style={{ margin: "2rem" }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert message={error} type="error" showIcon style={{ margin: "2rem" }} />
    );
  }

  if (!note) {
    return (
      <Alert
        message="笔记不存在"
        type="error"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}>
      <ConfirmDialog
        isOpen={deleteConfirm}
        title="删除笔记"
        message="确定要删除这条笔记吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/notes")}
          >
            返回笔记列表
          </Button>
          {canEdit() && (
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/notes/${noteId}/edit`)}
              >
                编辑笔记
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => setDeleteConfirm(true)}
              >
                删除笔记
              </Button>
            </Space>
          )}
        </div>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={1} style={{ margin: 0 }}>
              {note.title}
            </Title>
            <Space wrap>
              <Tag color={note.visibility === "public" ? "blue" : "default"}>
                {note.visibility === "public" ? "公开" : "私有"}
              </Tag>
              <Text type="secondary">创建于: {formatDate(note.createdAt)}</Text>
              {note.updatedAt && (
                <Text type="secondary">
                  更新于: {formatDate(note.updatedAt)}
                </Text>
              )}
            </Space>
            <Divider />
            <div style={{ minHeight: "400px" }}>
              <MarkdownRenderer content={note.content} />
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default NoteDetail;

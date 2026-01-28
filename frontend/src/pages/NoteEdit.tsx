import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Select,
  Alert,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Note } from "../types";
import { noteAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import { useToast } from "../components";

const { TextArea } = Input;
const { Title } = Typography;

const NoteEdit = () => {
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
      navigate("/courses");
      return;
    }
    if (noteId) {
      fetchNote();
    }
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
        summary: noteData.summary || "",
        visibility: noteData.visibility,
      });
    } catch (err: any) {
      const errorMsg =
        "获取笔记失败: " + (err.response?.data?.message || err.message);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;

    setSaving(true);
    setError("");

    if (!course) return;
    try {
      await noteAPI.updateNote(course.id, note.id, noteForm);
      success("笔记更新成功");
      navigate(`/notes/${noteId}`);
    } catch (err: any) {
      const errorMsg =
        "更新笔记失败: " + (err.response?.data?.message || err.message);
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

  if (error && !note) {
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

  if (!canEdit()) {
    return (
      <Alert
        message="无权限编辑此笔记"
        type="warning"
        showIcon
        action={
          <Button onClick={() => navigate("/notes")}>返回笔记列表</Button>
        }
        style={{ margin: "2rem" }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/notes/${noteId}`)}
        >
          取消编辑
        </Button>

        {error && <Alert message={error} type="error" showIcon />}

        <Card>
          <Title level={2}>编辑笔记</Title>
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={noteForm}
          >
            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: "请输入笔记标题" }]}
            >
              <Input
                value={noteForm.title}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, title: e.target.value })
                }
                placeholder="输入笔记标题"
              />
            </Form.Item>

            <Form.Item
              label="摘要"
              name="summary"
              extra="摘要将显示在笔记列表中，如果不填写，将自动截取内容前150字作为预览"
            >
              <TextArea
                rows={3}
                value={noteForm.summary}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, summary: e.target.value })
                }
                placeholder="输入笔记摘要（可选，用于列表预览，建议50-150字）"
              />
            </Form.Item>

            <Form.Item
              label="内容"
              name="content"
              rules={[{ required: true, message: "请输入笔记内容" }]}
            >
              <TextArea
                rows={20}
                value={noteForm.content}
                onChange={(e) =>
                  setNoteForm({ ...noteForm, content: e.target.value })
                }
                placeholder="输入笔记内容，支持 Markdown 格式"
              />
            </Form.Item>

            <Form.Item label="可见性" name="visibility">
              <Select
                value={noteForm.visibility}
                onChange={(value) =>
                  setNoteForm({
                    ...noteForm,
                    visibility: value as "public" | "private",
                  })
                }
              >
                <Select.Option value="private">
                  私有（仅自己可见）
                </Select.Option>
                <Select.Option value="public">公开（所有人可见）</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => navigate(`/notes/${noteId}`)}
                  disabled={saving}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={saving}
                >
                  保存
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default NoteEdit;

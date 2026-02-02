import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Select,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { noteAPI } from "../services";
import { useCourseStore } from "../stores";
import { useToast } from "../components";
import { getErrorMessage } from "../utils";

const { TextArea } = Input;
const { Title } = Typography;

const NoteCreate = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse || currentStudyingCourse;
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
      navigate("/courses");
    }
  }, [course, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setSaving(true);
    setError("");

    try {
      const response = await noteAPI.createNote(course.id, noteForm);
      success("笔记创建成功");
      navigate(`/notes/${response.data.id}`);
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
      <Alert
        message="请先选择一个课程"
        type="warning"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/notes")}>
          返回笔记列表
        </Button>

        {error ? <Alert title={error} type="error" showIcon /> : null}

        <Card>
          <Title level={2}>创建新笔记</Title>
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
                  { setNoteForm({ ...noteForm, title: e.target.value }); }
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
                  { setNoteForm({ ...noteForm, summary: e.target.value }); }
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
                  { setNoteForm({ ...noteForm, content: e.target.value }); }
                }
                placeholder="输入笔记内容，支持 Markdown 格式"
              />
            </Form.Item>

            <Form.Item label="可见性" name="visibility">
              <Select
                value={noteForm.visibility}
                onChange={(value) =>
                  { setNoteForm({
                    ...noteForm,
                    visibility: value,
                  }); }
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
                  onClick={() => navigate("/notes")}
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
                  创建
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default NoteCreate;

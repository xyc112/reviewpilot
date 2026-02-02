import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Space,
  Typography,
  List,
  Alert,
  Tag,
  Spin,
} from "antd";
import { PlusOutlined, FileTextOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Note } from "../types";
import { noteAPI } from "../services";
import { useCourseStore } from "../stores";
import {
  ConfirmDialog,
  useToast,
  SearchBox,
  ListEmptyState,
  ListItemCard,
} from "../components";
import { getErrorMessage } from "../utils";

const { Title, Text, Paragraph } = Typography;

const NoteList = () => {
  const navigate = useNavigate();
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const course = selectedCourse || currentStudyingCourse;

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
      navigate("/courses");
      return;
    }
    fetchNotes();
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

  const handleDeleteNote = async (noteId: string) => {
    setDeleteConfirm({ isOpen: true, noteId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.noteId) return;
    if (!course) return;
    try {
      await noteAPI.deleteNote(course.id, deleteConfirm.noteId);
      success("笔记删除成功");
      fetchNotes();
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

  // 过滤笔记
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // 搜索过滤
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [notes, searchQuery]);

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

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
      {error ? <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: "1.5rem" }}
        /> : null}

      {/* 搜索和操作栏 */}
      <Space
        orientation="vertical"
        size="middle"
        style={{ width: "100%", marginBottom: "1.5rem" }}
      >
        <Space.Compact style={{ width: "100%" }}>
          <SearchBox
            placeholder="搜索笔记标题或内容..."
            value={searchQuery}
            onChange={setSearchQuery}
            maxWidth={undefined}
            style={{ flex: 1 }}
          />
          {course ? <Link to="/notes/new">
              <Button type="primary" icon={<PlusOutlined />}>
                创建笔记
              </Button>
            </Link> : null}
        </Space.Compact>
      </Space>

      {/* 确认删除对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="删除笔记"
        message="确定要删除这条笔记吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteConfirm({ isOpen: false, noteId: null }); }}
      />

      {notes.length === 0 ? (
        <ListEmptyState
          variant="empty"
          icon={
            <FileTextOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
          }
          description={
            <Space orientation="vertical" size="small">
              <Text>暂无笔记</Text>
              <Text type="secondary">
                点击「创建笔记」按钮开始记录你的学习心得
              </Text>
            </Space>
          }
          action={
            course ? (
              <Link to="/notes/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  创建笔记
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : filteredNotes.length === 0 ? (
        <ListEmptyState
          variant="noResults"
          icon={
            <FileTextOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
          }
          description={
            <Space orientation="vertical" size="small">
              <Text>未找到匹配的笔记</Text>
              <Text type="secondary">尝试调整搜索条件</Text>
            </Space>
          }
          onClearFilter={() => { setSearchQuery(""); }}
          clearFilterLabel="清除搜索"
        />
      ) : (
        <List
          dataSource={filteredNotes}
          renderItem={(note) => (
            <ListItemCard>
              <Space style={{ width: "100%" }} align="start">
                <Link
                  to={`/notes/${note.id}`}
                  style={{
                    flex: 1,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <Space
                    orientation="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Space wrap>
                      <Title
                        level={4}
                        style={{ margin: 0, fontSize: "1.125rem" }}
                      >
                        {note.title}
                      </Title>
                      <Tag
                        color={note.visibility === "public" ? "blue" : "default"}
                      >
                        {note.visibility === "public" ? "公开" : "私有"}
                      </Tag>
                    </Space>
                  <Paragraph
                    ellipsis={{ rows: 2, expandable: false }}
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: "#78716c",
                    }}
                  >
                    {note.summary ||
                      (note.content.length > 150
                        ? note.content.substring(0, 150) + "..."
                        : note.content
                      ).replace(/\\n/g, " ")}
                  </Paragraph>
                    <Text type="secondary" style={{ fontSize: "0.8125rem" }}>
                      {formatDate(note.createdAt)}
                    </Text>
                  </Space>
                </Link>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  aria-label="删除笔记"
                />
              </Space>
            </ListItemCard>
          )}
        />
      )}
    </div>
  );
};

export default NoteList;

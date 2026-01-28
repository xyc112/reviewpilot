import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Empty,
  Alert,
  Divider,
  Tag,
} from "antd";
import {
  PlusOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  CloseOutlined,
  DownOutlined,
  UpOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Post, Comment, Course } from "../types";
import { postAPI, commentAPI, courseAPI } from "../services";
import { useAuthStore, useCourseStore } from "../stores";
import { ConfirmDialog, useToast, MarkdownRenderer } from "../components";

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

const Community = () => {
  const { courseId: courseIdParam } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const selectedCourse = useCourseStore((state) => state.selectedCourse);
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const { success, error: showError } = useToast();

  // 优先使用URL参数，其次使用当前学习的课程，最后使用选中的课程
  const courseId =
    courseIdParam ||
    currentStudyingCourse?.id?.toString() ||
    selectedCourse?.id?.toString();
  const [course, setCourse] = useState<{ id: number; title: string } | null>(
    null,
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<
    Record<number, boolean>
  >({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState<{
    postId: number;
    parentId: number | null;
  } | null>(null);

  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [replyComments, setReplyComments] = useState<Record<string, string>>(
    {},
  );
  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editPostData, setEditPostData] = useState({ title: "", content: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "post" | "comment";
    id: number;
    postId?: number;
  } | null>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // 获取回复框的 key
  const getReplyKey = (postId: number, parentId: number | null) => {
    return `${postId}-${parentId}`;
  };

  // 获取特定回复框的内容
  const getReplyContent = (postId: number, parentId: number | null) => {
    return replyComments[getReplyKey(postId, parentId)] || "";
  };

  // 设置特定回复框的内容
  const setReplyContent = (
    postId: number,
    parentId: number | null,
    content: string,
  ) => {
    setReplyComments((prev) => ({
      ...prev,
      [getReplyKey(postId, parentId)]: content,
    }));
  };

  // 清除特定回复框的内容
  const clearReplyContent = (postId: number, parentId: number | null) => {
    setReplyComments((prev) => {
      const newState = { ...prev };
      delete newState[getReplyKey(postId, parentId)];
      return newState;
    });
  };

  useEffect(() => {
    if (!courseId) {
      navigate("/courses");
      return;
    }
    fetchCourse();
    fetchPosts();
  }, [courseId, navigate, currentStudyingCourse, selectedCourse]);

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      const response = await courseAPI.getCourse(Number(courseId));
      setCourse({ id: response.data.id, title: response.data.title });
    } catch (err: any) {
      console.error("Failed to fetch course:", err);
      // 如果获取失败，使用selectedCourse作为后备
      if (selectedCourse && selectedCourse.id === Number(courseId)) {
        setCourse({ id: selectedCourse.id, title: selectedCourse.title });
      }
    }
  };

  const fetchPosts = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const response = await postAPI.getPosts(Number(courseId));
      setPosts(response.data);
    } catch (err: any) {
      setError(
        "获取帖子列表失败: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: number) => {
    if (!courseId) return;
    try {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      const response = await commentAPI.getComments(Number(courseId), postId);
      setComments((prev) => ({ ...prev, [postId]: response.data }));
    } catch (err: any) {
      showError(
        "获取评论失败: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleTogglePost = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  const handleCreatePost = async () => {
    if (!courseId || !newPost.title.trim() || !newPost.content.trim()) {
      showError("请填写标题和内容");
      return;
    }
    try {
      await postAPI.createPost(Number(courseId), {
        title: newPost.title,
        content: newPost.content,
      });
      success("帖子创建成功");
      setNewPost({ title: "", content: "" });
      setShowCreatePost(false);
      fetchPosts();
    } catch (err: any) {
      showError(
        "创建帖子失败: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleUpdatePost = async (postId: number) => {
    if (
      !courseId ||
      !editPostData.title.trim() ||
      !editPostData.content.trim()
    ) {
      showError("请填写标题和内容");
      return;
    }
    try {
      await postAPI.updatePost(Number(courseId), postId, {
        title: editPostData.title,
        content: editPostData.content,
      });
      success("帖子更新成功");
      setEditingPost(null);
      setEditPostData({ title: "", content: "" });
      fetchPosts();
    } catch (err: any) {
      showError(
        "更新帖子失败: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDeletePost = async () => {
    if (!deleteConfirm || !courseId || deleteConfirm.type !== "post") return;
    try {
      await postAPI.deletePost(Number(courseId), deleteConfirm.id);
      success("帖子删除成功");
      setDeleteConfirm(null);
      fetchPosts();
      if (expandedPost === deleteConfirm.id) {
        setExpandedPost(null);
      }
    } catch (err: any) {
      showError(
        "删除帖子失败: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleCreateComment = async (
    postId: number,
    parentId: number | null = null,
  ) => {
    const content = getReplyContent(postId, parentId);
    if (!courseId || !content.trim()) {
      showError("请输入评论内容");
      return;
    }
    try {
      await commentAPI.createComment(Number(courseId), postId, {
        content: content,
        parentId: parentId,
      });
      success("评论发布成功");
      clearReplyContent(postId, parentId);
      setShowReplyForm(null);
      fetchComments(postId);
    } catch (err: any) {
      showError(
        "发布评论失败: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDeleteComment = async () => {
    if (
      !deleteConfirm ||
      !courseId ||
      deleteConfirm.type !== "comment" ||
      !deleteConfirm.postId
    )
      return;
    try {
      await commentAPI.deleteComment(
        Number(courseId),
        deleteConfirm.postId,
        deleteConfirm.id,
      );
      success("评论删除成功");
      setDeleteConfirm(null);
      fetchComments(deleteConfirm.postId);
    } catch (err: any) {
      showError(
        "删除评论失败: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const startEditPost = (post: Post) => {
    setEditingPost(post.id);
    setEditPostData({ title: post.title, content: post.content });
  };

  const cancelEditPost = () => {
    setEditingPost(null);
    setEditPostData({ title: "", content: "" });
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

  // 过滤帖子
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 搜索过滤
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.authorUsername &&
          post.authorUsername
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [posts, searchQuery]);

  const renderComments = (
    postId: number,
    parentId: number | null = null,
    level: number = 0,
  ): React.ReactNode => {
    const postComments = comments[postId] || [];
    const filteredComments = postComments.filter(
      (c) => c.parentId === parentId,
    );

    if (filteredComments.length === 0) return null;

    return (
      <Space
        direction="vertical"
        size="small"
        style={{
          width: "100%",
          marginLeft: level > 0 ? "2rem" : "0",
          borderLeft: level > 0 ? "2px solid #f0f0f0" : "none",
          paddingLeft: level > 0 ? "1rem" : "0",
        }}
      >
        {filteredComments.map((comment) => (
          <Card
            key={comment.id}
            size="small"
            style={{
              backgroundColor: "#fafafa",
              border: "1px solid #f0f0f0",
            }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space>
                  <Text strong style={{ fontSize: "0.875rem" }}>
                    {comment.authorUsername || `用户 ${comment.authorId}`}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "0.8125rem" }}>
                    {formatDate(comment.createdAt)}
                  </Text>
                </Space>
                {(isAdmin || user?.id === comment.authorId) && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      setDeleteConfirm({
                        type: "comment",
                        id: comment.id,
                        postId,
                      })
                    }
                    title="删除评论"
                  />
                )}
              </div>
              <div>
                <MarkdownRenderer content={comment.content} />
              </div>
              <Button
                type="link"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => {
                  setShowReplyForm({ postId, parentId: comment.id });
                  setTimeout(() => commentInputRef.current?.focus(), 100);
                }}
              >
                回复
              </Button>
              {showReplyForm?.postId === postId &&
                showReplyForm?.parentId === comment.id && (
                  <Card
                    size="small"
                    style={{
                      marginTop: "0.75rem",
                      backgroundColor: "#fff",
                      border: "1px solid #d9d9d9",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <TextArea
                        ref={commentInputRef}
                        value={getReplyContent(postId, comment.id)}
                        onChange={(e) =>
                          setReplyContent(postId, comment.id, e.target.value)
                        }
                        placeholder="输入回复..."
                        rows={3}
                      />
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          icon={<SendOutlined />}
                          onClick={() =>
                            handleCreateComment(postId, comment.id)
                          }
                        >
                          发送
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setShowReplyForm(null);
                            clearReplyContent(postId, comment.id);
                          }}
                        >
                          取消
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                )}
              {renderComments(postId, comment.id, level + 1)}
            </Space>
          </Card>
        ))}
      </Space>
    );
  };

  if (!courseId) {
    return (
      <Alert
        message="课程ID无效"
        type="error"
        showIcon
        style={{ margin: "2rem" }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Text>加载中...</Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1rem" }}>
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title={deleteConfirm?.type === "post" ? "删除帖子" : "删除评论"}
        message={`确定要删除这个${deleteConfirm?.type === "post" ? "帖子" : "评论"}吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={() => {
          if (deleteConfirm?.type === "post") {
            handleDeletePost();
          } else {
            handleDeleteComment();
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: "1.5rem" }}
        />
      )}

      {/* 搜索栏 */}
      <Space
        style={{ width: "100%", marginBottom: "1.5rem" }}
        direction="vertical"
        size="middle"
      >
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="搜索帖子标题、内容或作者..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreatePost(!showCreatePost)}
          >
            {showCreatePost ? "取消发布" : "发布新帖"}
          </Button>
        </Space.Compact>
      </Space>

      {showCreatePost && (
        <Card style={{ marginBottom: "2rem" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreatePost();
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>标题:</Text>
                <Input
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  required
                  placeholder="输入帖子标题"
                  style={{ marginTop: "0.5rem" }}
                />
              </div>

              <div>
                <Text strong>内容:</Text>
                <TextArea
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  rows={15}
                  required
                  placeholder="输入帖子内容，支持 Markdown 格式"
                  style={{ marginTop: "0.5rem" }}
                />
              </div>

              <Space>
                <Button
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewPost({ title: "", content: "" });
                  }}
                >
                  <CloseOutlined />
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                >
                  发布
                </Button>
              </Space>
            </Space>
          </form>
        </Card>
      )}

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {posts.length === 0 && !showCreatePost ? (
          <Empty
            image={
              <MessageOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
            }
            description={
              <Space direction="vertical" size="small">
                <Title level={4}>还没有帖子</Title>
                <Text type="secondary">成为第一个发布帖子的人吧！</Text>
              </Space>
            }
          />
        ) : filteredPosts.length === 0 && searchQuery ? (
          <Empty
            image={
              <MessageOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
            }
            description={
              <Space direction="vertical" size="small">
                <Title level={4}>未找到匹配的帖子</Title>
                <Text type="secondary">尝试调整搜索条件</Text>
              </Space>
            }
          >
            <Button type="primary" onClick={() => setSearchQuery("")}>
              清除搜索
            </Button>
          </Empty>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card
              key={post.id}
              hoverable
              style={{ border: "1px solid #d9d9d9" }}
              actions={[
                <Space key="actions">
                  {(isAdmin || user?.id === post.authorId) && (
                    <>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => startEditPost(post)}
                        title="编辑"
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() =>
                          setDeleteConfirm({ type: "post", id: post.id })
                        }
                        title="删除"
                      />
                    </>
                  )}
                  <Button
                    type="text"
                    icon={
                      expandedPost === post.id ? (
                        <UpOutlined />
                      ) : (
                        <DownOutlined />
                      )
                    }
                    onClick={() => handleTogglePost(post.id)}
                    title={expandedPost === post.id ? "收起" : "展开"}
                  />
                </Space>,
              ]}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div>
                  <Title
                    level={4}
                    style={{ margin: 0, marginBottom: "0.5rem" }}
                  >
                    {post.title}
                  </Title>
                  <Space>
                    <Text type="secondary" strong>
                      {post.authorUsername || `用户 ${post.authorId}`}
                    </Text>
                    <Text type="secondary">{formatDate(post.createdAt)}</Text>
                  </Space>
                </div>

                {editingPost === post.id ? (
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <Input
                      value={editPostData.title}
                      onChange={(e) =>
                        setEditPostData({
                          ...editPostData,
                          title: e.target.value,
                        })
                      }
                    />
                    <TextArea
                      value={editPostData.content}
                      onChange={(e) =>
                        setEditPostData({
                          ...editPostData,
                          content: e.target.value,
                        })
                      }
                      rows={6}
                    />
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleUpdatePost(post.id)}
                      >
                        保存
                      </Button>
                      <Button size="small" onClick={cancelEditPost}>
                        取消
                      </Button>
                    </Space>
                  </Space>
                ) : (
                  <div>
                    <MarkdownRenderer content={post.content} />
                  </div>
                )}

                {expandedPost === post.id && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Title level={5} style={{ margin: 0 }}>
                          评论
                        </Title>
                        {loadingComments[post.id] && (
                          <Text type="secondary">加载中...</Text>
                        )}
                      </div>

                      {!showReplyForm ||
                      showReplyForm.postId !== post.id ||
                      showReplyForm.parentId !== null ? (
                        <Card
                          size="small"
                          style={{ backgroundColor: "#fafafa" }}
                        >
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: "100%" }}
                          >
                            <TextArea
                              value={getReplyContent(post.id, null)}
                              onChange={(e) =>
                                setReplyContent(post.id, null, e.target.value)
                              }
                              placeholder="输入评论..."
                              rows={3}
                            />
                            <Button
                              type="primary"
                              size="small"
                              icon={<SendOutlined />}
                              onClick={() => handleCreateComment(post.id, null)}
                            >
                              发布评论
                            </Button>
                          </Space>
                        </Card>
                      ) : null}

                      {renderComments(post.id)}
                    </Space>
                  </div>
                )}
              </Space>
            </Card>
          ))
        ) : null}
      </Space>
    </div>
  );
};

export default Community;

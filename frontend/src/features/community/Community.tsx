import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import type { Post, Comment } from "@/shared/types";
import { postAPI, commentAPI, courseAPI } from "@/shared/api";
import { useAuthStore, useCourseStore } from "@/shared/stores";
import {
  ConfirmDialog,
  useToast,
  MarkdownRenderer,
  SearchBox,
  ListEmptyState,
} from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/shared/config/routes";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Alert, AlertTitle } from "@/shared/components/ui/alert";
import { LoadingSpinner } from "@/shared/components";

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

  const courseId =
    courseIdParam ??
    (currentStudyingCourse != null
      ? String(currentStudyingCourse.id)
      : undefined) ??
    (selectedCourse != null ? String(selectedCourse.id) : undefined);
  const [, setCourse] = useState<{ id: number; title: string } | null>(null);
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

  const getReplyKey = (postId: number, parentId: number | null) => {
    return `${String(postId)}-${String(parentId)}`;
  };

  const getReplyContent = (postId: number, parentId: number | null) => {
    return replyComments[getReplyKey(postId, parentId)] ?? "";
  };

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

  const clearReplyContent = (postId: number, parentId: number | null) => {
    setReplyComments((prev) => {
      const key = getReplyKey(postId, parentId);
      const { [key]: _omit, ...rest } = prev;
      void _omit;
      return rest;
    });
  };

  useEffect(() => {
    if (!courseId) {
      void navigate(ROUTES.COURSES);
      return;
    }
    void fetchCourse();
    void fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchCourse/fetchPosts 依赖 courseId，已在依赖中
  }, [courseId, navigate, currentStudyingCourse, selectedCourse]);

  const fetchCourse = async () => {
    if (!courseId) return;
    try {
      const response = await courseAPI.getCourse(Number(courseId));
      setCourse({ id: response.data.id, title: response.data.title });
    } catch (err: unknown) {
      console.error("Failed to fetch course:", getErrorMessage(err));
      if (selectedCourse?.id === Number(courseId)) {
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
    } catch (err: unknown) {
      setError("获取帖子列表失败: " + getErrorMessage(err));
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
    } catch (err: unknown) {
      showError("获取评论失败: " + getErrorMessage(err));
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleTogglePost = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!(postId in comments)) {
        void fetchComments(postId);
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
      void fetchPosts();
    } catch (err: unknown) {
      showError("创建帖子失败: " + getErrorMessage(err));
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
      void fetchPosts();
    } catch (err: unknown) {
      showError("更新帖子失败: " + getErrorMessage(err));
    }
  };

  const handleDeletePost = async () => {
    if (!deleteConfirm || !courseId || deleteConfirm.type !== "post") return;
    try {
      await postAPI.deletePost(Number(courseId), deleteConfirm.id);
      success("帖子删除成功");
      setDeleteConfirm(null);
      void fetchPosts();
      if (expandedPost === deleteConfirm.id) {
        setExpandedPost(null);
      }
    } catch (err: unknown) {
      showError("删除帖子失败: " + getErrorMessage(err));
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
      void fetchComments(postId);
    } catch (err: unknown) {
      showError("发布评论失败: " + getErrorMessage(err));
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
      void fetchComments(deleteConfirm.postId);
    } catch (err: unknown) {
      showError("删除评论失败: " + getErrorMessage(err));
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

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorUsername?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [posts, searchQuery]);

  const renderComments = (
    postId: number,
    parentId: number | null = null,
    level = 0,
  ): React.ReactNode => {
    const postComments = comments[postId] ?? [];
    const filteredComments = postComments.filter(
      (c) => c.parentId === parentId,
    );

    if (filteredComments.length === 0) {
      return null;
    }

    return (
      <div
        className="flex w-full flex-col gap-2"
        style={{
          marginLeft: level > 0 ? "2rem" : "0",
          borderLeft: level > 0 ? "2px solid var(--border)" : "none",
          paddingLeft: level > 0 ? "1rem" : "0",
        }}
      >
        {filteredComments.map((comment) => (
          <Card key={comment.id} className="border bg-muted/30 py-3">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.authorUsername ??
                      `用户 ${String(comment.authorId)}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                {isAdmin || user?.id === comment.authorId ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeleteConfirm({
                        type: "comment",
                        id: comment.id,
                        postId,
                      });
                    }}
                    title="删除评论"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
              <div>
                <MarkdownRenderer content={comment.content} />
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-sm"
                onClick={() => {
                  setShowReplyForm({ postId, parentId: comment.id });
                  setTimeout(() => commentInputRef.current?.focus(), 100);
                }}
              >
                <MessageCircle className="mr-1 size-3.5" />
                回复
              </Button>
              {showReplyForm?.postId === postId &&
                showReplyForm.parentId === comment.id && (
                  <Card className="mt-3 border bg-background">
                    <CardContent className="flex flex-col gap-2 p-4">
                      <Textarea
                        ref={commentInputRef}
                        value={getReplyContent(postId, comment.id)}
                        onChange={(e) => {
                          setReplyContent(postId, comment.id, e.target.value);
                        }}
                        placeholder="输入回复..."
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            void handleCreateComment(postId, comment.id);
                          }}
                        >
                          <Send className="size-4" />
                          发送
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowReplyForm(null);
                            clearReplyContent(postId, comment.id);
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              {renderComments(postId, comment.id, level + 1)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!courseId) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>课程ID无效</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4">
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title={deleteConfirm?.type === "post" ? "删除帖子" : "删除评论"}
        message={`确定要删除这个${deleteConfirm?.type === "post" ? "帖子" : "评论"}吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={() => {
          if (deleteConfirm?.type === "post") {
            void handleDeletePost();
          } else {
            void handleDeleteComment();
          }
        }}
        onCancel={() => {
          setDeleteConfirm(null);
        }}
      />

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      ) : null}

      <div className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBox
          placeholder="搜索帖子标题、内容或作者..."
          value={searchQuery}
          onChange={setSearchQuery}
          maxWidth={undefined}
          style={{ flex: 1 }}
        />
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setShowCreatePost(!showCreatePost);
          }}
        >
          <Plus className="size-4" />
          {showCreatePost ? "取消发布" : "发布新帖"}
        </Button>
      </div>

      {showCreatePost ? (
        <Card className="mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreatePost();
            }}
          >
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">标题</label>
                <Input
                  value={newPost.title}
                  onChange={(e) => {
                    setNewPost({ ...newPost, title: e.target.value });
                  }}
                  required
                  placeholder="输入帖子标题"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">内容</label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => {
                    setNewPost({ ...newPost, content: e.target.value });
                  }}
                  rows={15}
                  required
                  placeholder="输入帖子内容，支持 Markdown 格式"
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewPost({ title: "", content: "" });
                  }}
                >
                  <X className="size-4" />
                  取消
                </Button>
                <Button type="submit">
                  <Send className="size-4" />
                  发布
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      ) : null}

      <div className="flex w-full flex-col gap-6">
        {posts.length === 0 && !showCreatePost ? (
          <ListEmptyState
            variant="empty"
            icon={
              <MessageCircle className="size-16 text-muted-foreground/50" />
            }
            description={
              <div className="flex flex-col gap-1 text-center">
                <h3 className="text-lg font-semibold">还没有帖子</h3>
                <span className="text-sm text-muted-foreground">
                  成为第一个发布帖子的人吧！
                </span>
              </div>
            }
          />
        ) : filteredPosts.length === 0 && searchQuery ? (
          <ListEmptyState
            variant="noResults"
            icon={
              <MessageCircle className="size-16 text-muted-foreground/50" />
            }
            description={
              <div className="flex flex-col gap-1 text-center">
                <h3 className="text-lg font-semibold">未找到匹配的帖子</h3>
                <span className="text-sm text-muted-foreground">
                  尝试调整搜索条件
                </span>
              </div>
            }
            onClearFilter={() => {
              setSearchQuery("");
            }}
            clearFilterLabel="清除搜索"
          />
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="border transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-4 pt-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">
                      {post.authorUsername ?? `用户 ${String(post.authorId)}`}
                    </span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                {editingPost === post.id ? (
                  <div className="flex flex-col gap-4">
                    <Input
                      value={editPostData.title}
                      onChange={(e) => {
                        setEditPostData({
                          ...editPostData,
                          title: e.target.value,
                        });
                      }}
                    />
                    <Textarea
                      value={editPostData.content}
                      onChange={(e) => {
                        setEditPostData({
                          ...editPostData,
                          content: e.target.value,
                        });
                      }}
                      rows={6}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          void handleUpdatePost(post.id);
                        }}
                      >
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditPost}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <MarkdownRenderer content={post.content} />
                  </div>
                )}

                {expandedPost === post.id && (
                  <div className="mt-6 border-t pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-medium">评论</h4>
                        {loadingComments[post.id] ? (
                          <span className="text-sm text-muted-foreground">
                            加载中...
                          </span>
                        ) : null}
                      </div>

                      {showReplyForm?.postId !== post.id ||
                      showReplyForm.parentId !== null ? (
                        <Card className="bg-muted/30">
                          <CardContent className="flex flex-col gap-2 p-4">
                            <Textarea
                              value={getReplyContent(post.id, null)}
                              onChange={(e) => {
                                setReplyContent(post.id, null, e.target.value);
                              }}
                              placeholder="输入评论..."
                              rows={3}
                              className="resize-none"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                void handleCreateComment(post.id, null);
                              }}
                            >
                              <Send className="size-4" />
                              发布评论
                            </Button>
                          </CardContent>
                        </Card>
                      ) : null}

                      {renderComments(post.id)}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap items-center gap-1 border-t bg-muted/20 px-6 py-3">
                {isAdmin || user?.id === post.authorId ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        startEditPost(post);
                      }}
                      title="编辑"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeleteConfirm({ type: "post", id: post.id });
                      }}
                      title="删除"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    handleTogglePost(post.id);
                  }}
                  title={expandedPost === post.id ? "收起" : "展开"}
                >
                  {expandedPost === post.id ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : null}
      </div>
    </div>
  );
};

export default Community;

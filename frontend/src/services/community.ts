import api from "./apiClient";
import type { Post, Comment } from "../types";

export const postAPI = {
  getPosts: (courseId: number) =>
    api.get<Post[]>(`/api/courses/${String(courseId)}/posts`),
  getPost: (courseId: number, postId: number) =>
    api.get<Post>(`/api/courses/${String(courseId)}/posts/${String(postId)}`),
  createPost: (courseId: number, postData: Partial<Post>) =>
    api.post<Post>(`/api/courses/${String(courseId)}/posts`, postData),
  updatePost: (courseId: number, postId: number, postData: Partial<Post>) =>
    api.put<Post>(`/api/courses/${String(courseId)}/posts/${String(postId)}`, postData),
  deletePost: (courseId: number, postId: number) =>
    api.delete(`/api/courses/${String(courseId)}/posts/${String(postId)}`),
};

export const commentAPI = {
  getComments: (courseId: number, postId: number) =>
    api.get<Comment[]>(`/api/courses/${String(courseId)}/posts/${String(postId)}/comments`),
  getComment: (courseId: number, postId: number, commentId: number) =>
    api.get<Comment>(
      `/api/courses/${String(courseId)}/posts/${String(postId)}/comments/${String(commentId)}`,
    ),
  createComment: (
    courseId: number,
    postId: number,
    commentData: Partial<Comment>,
  ) =>
    api.post<Comment>(
      `/api/courses/${String(courseId)}/posts/${String(postId)}/comments`,
      commentData,
    ),
  updateComment: (
    courseId: number,
    postId: number,
    commentId: number,
    commentData: Partial<Comment>,
  ) =>
    api.put<Comment>(
      `/api/courses/${String(courseId)}/posts/${String(postId)}/comments/${String(commentId)}`,
      commentData,
    ),
  deleteComment: (courseId: number, postId: number, commentId: number) =>
    api.delete(
      `/api/courses/${String(courseId)}/posts/${String(postId)}/comments/${String(commentId)}`,
    ),
};

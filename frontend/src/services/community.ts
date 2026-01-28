import api from "./apiClient";
import { Post, Comment } from "../types";

export const postAPI = {
  getPosts: (courseId: number) =>
    api.get<Post[]>(`/api/courses/${courseId}/posts`),
  getPost: (courseId: number, postId: number) =>
    api.get<Post>(`/api/courses/${courseId}/posts/${postId}`),
  createPost: (courseId: number, postData: Partial<Post>) =>
    api.post<Post>(`/api/courses/${courseId}/posts`, postData),
  updatePost: (courseId: number, postId: number, postData: Partial<Post>) =>
    api.put<Post>(`/api/courses/${courseId}/posts/${postId}`, postData),
  deletePost: (courseId: number, postId: number) =>
    api.delete(`/api/courses/${courseId}/posts/${postId}`),
};

export const commentAPI = {
  getComments: (courseId: number, postId: number) =>
    api.get<Comment[]>(`/api/courses/${courseId}/posts/${postId}/comments`),
  getComment: (courseId: number, postId: number, commentId: number) =>
    api.get<Comment>(
      `/api/courses/${courseId}/posts/${postId}/comments/${commentId}`,
    ),
  createComment: (
    courseId: number,
    postId: number,
    commentData: Partial<Comment>,
  ) =>
    api.post<Comment>(
      `/api/courses/${courseId}/posts/${postId}/comments`,
      commentData,
    ),
  updateComment: (
    courseId: number,
    postId: number,
    commentId: number,
    commentData: Partial<Comment>,
  ) =>
    api.put<Comment>(
      `/api/courses/${courseId}/posts/${postId}/comments/${commentId}`,
      commentData,
    ),
  deleteComment: (courseId: number, postId: number, commentId: number) =>
    api.delete(
      `/api/courses/${courseId}/posts/${postId}/comments/${commentId}`,
    ),
};

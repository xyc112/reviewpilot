import api from "./apiClient";

export interface CourseFileItem {
  id: number;
  filename: string;
  contentType: string;
  uploadedBy: number | null;
  createdAt: string;
}

const courseFileBase = (courseId: number) =>
  `/api/courses/${String(courseId)}/files`;

export const courseFileAPI = {
  list: (courseId: number) =>
    api.get<CourseFileItem[]>(courseFileBase(courseId)),

  upload: (courseId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<CourseFileItem>(courseFileBase(courseId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 获取文件为 Blob 并返回 object URL，用完后需 URL.revokeObjectURL */
  getDownloadBlobUrl: async (
    courseId: number,
    fileId: number,
  ): Promise<string> => {
    const res = await api.get<Blob>(
      `${courseFileBase(courseId)}/${String(fileId)}`,
      { responseType: "blob" },
    );
    return URL.createObjectURL(res.data);
  },

  delete: (courseId: number, fileId: number) =>
    api.delete(`${courseFileBase(courseId)}/${String(fileId)}`),
};

// NoteTypes.ets

// 笔记实体
export interface Note {
  id: string;
  title: string;
  content: string;
  courseId: number;
  authorId: number;
  createdAt: string;
  updatedAt?: string;
}

// 创建/更新笔记请求
export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface UpdateNoteRequest extends CreateNoteRequest {}

// ========== 统一的响应类型体系 ==========
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface ErrorApiResponse extends BaseApiResponse {
  success: false;
  message: string;
}

export interface NoteListResponse extends BaseApiResponse {
  data?: Note[];
  total?: number;
}

export interface NoteDetailResponse extends BaseApiResponse {
  data?: Note;
}

export interface NoteOperationResponse extends BaseApiResponse {
  data?: Note;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
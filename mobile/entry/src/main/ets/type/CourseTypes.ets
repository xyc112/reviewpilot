// CourseTypes.ets

// 课程级别枚举
export enum CourseLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED"
}

// 课程基础信息
export interface Course {
  id: number;
  title: string;
  description: string;
  tags: string[];
  level: CourseLevel;
  authorId: number;
  createdAt: string;
  updatedAt?: string;
}

// 课程详情（包含大纲）
export interface CourseDetail extends Course {
  syllabus: SyllabusItem[];
}

// 课程大纲项
export interface SyllabusItem {
  id: number;
  title: string;
  duration: number;
  order: number;
}

// 创建/更新课程请求
export interface CreateCourseRequest {
  title: string;
  description: string;
  tags: string[];
  level: CourseLevel;
}

export interface UpdateCourseRequest extends CreateCourseRequest {}

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

export interface CourseListResponse extends BaseApiResponse {
  data?: Course[];
  total?: number;
}

export interface CourseDetailResponse extends BaseApiResponse {
  data?: CourseDetail;
}

export interface CourseOperationResponse extends BaseApiResponse {
  data?: Course;
}


export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

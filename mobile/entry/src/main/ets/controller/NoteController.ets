// NoteController.ets
import http from '@ohos.net.http';
import { ApiConfig } from '../config/ApiConfig';
import {
  Note, CreateNoteRequest, UpdateNoteRequest,
  NoteListResponse, NoteDetailResponse, NoteOperationResponse,
  ErrorResponse, BaseApiResponse, ErrorApiResponse
} from '../type/NoteTypes';

// 定义HTTP头部接口
interface HttpHeaders {
  'Content-Type': string;
  Authorization?: string;
}

export class NoteController {
  private baseUrl: string = ApiConfig.BASE_URL;
  private token: string = AppStorage.get<string>('userToken') || '';

  constructor(token: string) {
    this.token = token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  // 获取认证头部
  private getAuthHeaders(): HttpHeaders {
    const headers: HttpHeaders = {
      'Content-Type': 'application/json'
    };

    if (this.token && this.token.trim().length > 0) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('设置Authorization头部，token长度:', this.token.length);
    } else {
      console.warn('Token为空或无效，未设置Authorization头部');
    }

    return headers;
  }

  /**
   * 获取课程笔记列表
   */
  async listNotes(courseId: number): Promise<NoteListResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/notes`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000
      };

      return new Promise<NoteListResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取笔记列表请求失败:', err);
            const errorResponse: NoteListResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleListResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('获取笔记列表异常:', error);
      const errorResponse: NoteListResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理笔记列表响应
   */
  private handleListResponse(data: http.HttpResponse, resolve: (result: NoteListResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const notes: Note[] = JSON.parse(resultString) as Note[];
        const successResponse: NoteListResponse = {
          success: true,
          data: notes,
          total: notes.length
        };
        resolve(successResponse);
      } else {
        const errorResponse: NoteListResponse = this.handleErrorResponseGeneric<NoteListResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析笔记列表响应失败:', parseError);
      const errorResponse: NoteListResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 获取笔记详情
   */
  async getNote(courseId: number, noteId: string): Promise<NoteDetailResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/notes/${noteId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.GET,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000
      };

      return new Promise<NoteDetailResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('获取笔记详情请求失败:', err);
            const errorResponse: NoteDetailResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleDetailResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('获取笔记详情异常:', error);
      const errorResponse: NoteDetailResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理笔记详情响应
   */
  private handleDetailResponse(data: http.HttpResponse, resolve: (result: NoteDetailResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const note: Note = JSON.parse(resultString) as Note;
        const successResponse: NoteDetailResponse = {
          success: true,
          data: note
        };
        resolve(successResponse);
      } else {
        const errorResponse: NoteDetailResponse = this.handleErrorResponseGeneric<NoteDetailResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析笔记详情响应失败:', parseError);
      const errorResponse: NoteDetailResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 创建笔记
   */
  async createNote(courseId: number, noteData: CreateNoteRequest): Promise<NoteOperationResponse> {
    try {
      const validationResult: string | null = this.validateNoteData(noteData);
      if (validationResult) {
        const errorResponse: NoteOperationResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/notes`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.POST,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000,
        extraData: JSON.stringify(noteData)
      };

      return new Promise<NoteOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('创建笔记请求失败:', err);
            const errorResponse: NoteOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleCreateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('创建笔记异常:', error);
      const errorResponse: NoteOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理创建笔记响应
   */
  private handleCreateResponse(data: http.HttpResponse, resolve: (result: NoteOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 201) {
        const note: Note = JSON.parse(resultString) as Note;
        const successResponse: NoteOperationResponse = {
          success: true,
          data: note,
          message: '笔记创建成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: NoteOperationResponse = this.handleErrorResponseGeneric<NoteOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析创建笔记响应失败:', parseError);
      const errorResponse: NoteOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 更新笔记
   */
  async updateNote(courseId: number, noteId: string, noteData: UpdateNoteRequest): Promise<NoteOperationResponse> {
    try {
      const validationResult: string | null = this.validateNoteData(noteData);
      if (validationResult) {
        const errorResponse: NoteOperationResponse = {
          success: false,
          message: validationResult
        };
        return errorResponse;
      }

      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/notes/${noteId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.PUT,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000,
        extraData: JSON.stringify(noteData)
      };

      return new Promise<NoteOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('更新笔记请求失败:', err);
            const errorResponse: NoteOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleUpdateResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('更新笔记异常:', error);
      const errorResponse: NoteOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理更新笔记响应
   */
  private handleUpdateResponse(data: http.HttpResponse, resolve: (result: NoteOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;
      const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);

      if (responseCode === 200) {
        const note: Note = JSON.parse(resultString) as Note;
        const successResponse: NoteOperationResponse = {
          success: true,
          data: note,
          message: '笔记更新成功'
        };
        resolve(successResponse);
      } else {
        const errorResponse: NoteOperationResponse = this.handleErrorResponseGeneric<NoteOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析更新笔记响应失败:', parseError);
      const errorResponse: NoteOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 删除笔记
   */
  async deleteNote(courseId: number, noteId: string): Promise<NoteOperationResponse> {
    try {
      const httpRequest: http.HttpRequest = http.createHttp();
      const url: string = `${this.baseUrl}/api/courses/${courseId}/notes/${noteId}`;

      const requestOptions: http.HttpRequestOptions = {
        method: http.RequestMethod.DELETE,
        header: this.getAuthHeaders(),
        readTimeout: 60000,
        connectTimeout: 60000
      };

      return new Promise<NoteOperationResponse>((resolve) => {
        httpRequest.request(url, requestOptions, (err: Error, data: http.HttpResponse) => {
          if (err) {
            console.error('删除笔记请求失败:', err);
            const errorResponse: NoteOperationResponse = {
              success: false,
              message: '网络请求失败: ' + err.message
            };
            resolve(errorResponse);
            return;
          }

          this.handleDeleteResponse(data, resolve);
          httpRequest.destroy();
        });
      });

    } catch (error) {
      console.error('删除笔记异常:', error);
      const errorResponse: NoteOperationResponse = {
        success: false,
        message: '请求异常: ' + (error as Error).message
      };
      return errorResponse;
    }
  }

  /**
   * 处理删除笔记响应
   */
  private handleDeleteResponse(data: http.HttpResponse, resolve: (result: NoteOperationResponse) => void): void {
    try {
      const responseCode: number = data.responseCode;

      if (responseCode === 204) {
        const successResponse: NoteOperationResponse = {
          success: true,
          message: '笔记删除成功'
        };
        resolve(successResponse);
      } else {
        const resultString: string = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
        const errorResponse: NoteOperationResponse = this.handleErrorResponseGeneric<NoteOperationResponse>(
          responseCode,
          resultString
        );
        resolve(errorResponse);
      }
    } catch (parseError) {
      console.error('解析删除笔记响应失败:', parseError);
      const errorResponse: NoteOperationResponse = {
        success: false,
        message: '解析响应数据失败'
      };
      resolve(errorResponse);
    }
  }

  /**
   * 统一的泛型错误处理方法
   */
  private handleErrorResponseGeneric<T extends BaseApiResponse>(
    responseCode: number,
    resultString: string
  ): T {
    try {
      const errorData: ErrorResponse = JSON.parse(resultString) as ErrorResponse;

      let errorMessage: string = errorData.message || `请求失败 (${responseCode})`;

      switch (responseCode) {
        case 401:
          errorMessage = '认证失败，请重新登录';
          break;
        case 403:
          errorMessage = '权限不足，无法执行此操作';
          break;
        case 404:
          errorMessage = '笔记不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误，请稍后重试';
          break;
      }

      const errorResponse: ErrorApiResponse = {
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString()
      };

      return errorResponse as T;

    } catch (parseError) {
      const parseErrorResponse: ErrorApiResponse = {
        success: false,
        message: `请求失败: ${responseCode}`,
        timestamp: new Date().toISOString()
      };

      return parseErrorResponse as T;
    }
  }

  /**
   * 验证笔记数据
   */
  private validateNoteData(noteData: CreateNoteRequest): string | null {
    if (!noteData.title || noteData.title.trim().length === 0) {
      return '笔记标题不能为空';
    }

    if (noteData.title.trim().length < 2) {
      return '笔记标题至少2个字符';
    }

    if (!noteData.content || noteData.content.trim().length === 0) {
      return '笔记内容不能为空';
    }

    return null;
  }
}
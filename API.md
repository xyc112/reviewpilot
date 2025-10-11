# ReviewPilot API 接口文档

## 文档概述

### 版本信息
- **API版本**: v1.0.0
- **文档版本**: 1.0
- **更新日期**: 2025-10-03

### 基础信息
- **基础URL**: `http://localhost:8080/api`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: JWT Token

## 通用约定

### 请求头规范
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

### 统一响应格式

#### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
  },
  "timestamp": "2024-01-01T00:00:00.000+00:00"
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "错误描述信息",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000+00:00"
}
```

### 分页响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "content": [],
    "totalElements": 100,
    "totalPages": 10,
    "size": 10,
    "number": 0,
    "first": true,
    "last": false
  }
}
```

## 认证授权 API

### 用户登录

- **URL**: `POST /auth/login`
- **描述**: 用户登录获取访问令牌
- **请求体**:

```json
{
  "username": "string, required, 用户名",
  "password": "string, required, 密码"
}
```

- **响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_string",
    "userId": 1,
    "username": "student01",
    "realName": "张三",
    "email": "student@nju.edu.cn",
    "expiresIn": 3600
  }
}
```

### 用户注册

- **URL**: `POST /auth/register`
- **描述**: 新用户注册
- **请求体**:

```json
{
  "username": "string, required, 用户名",
  "password": "string, required, 密码",
  "email": "string, required, 邮箱",
  "realName": "string, required, 真实姓名",
  "studentId": "string, optional, 学号"
}
```

### 令牌刷新

- **URL**: `POST /auth/refresh`
- **描述**: 刷新访问令牌
- **Header**: `Authorization: Bearer {token}`

## 课程管理 API

### 获取课程列表

- **URL**: `GET /courses`
- **参数**:
  - `page`: integer, optional, 页码 (默认0)
  - `size`: integer, optional, 每页大小 (默认10)
  - `semester`: string, optional, 学期筛选
- **权限**: 需要登录

### 获取课程详情

- **URL**: `GET /courses/{courseId}`
- **参数**: `courseId` - 课程ID
- **响应**: 包含课程基本信息、知识点统计等

### 创建课程

- **URL**: `POST /courses`
- **权限**: 教师权限
- **请求体**:

```json
{
  "courseName": "string, required, 课程名称",
  "syllabus": "string, required, 课程描述",
  "credit": "number, required, 学分",
  "teacher": "string, required, 授课教师",
  "semester": "string, required, 学期"
}
```

### 学生选课

- **URL**: `POST /courses/{courseId}/enroll`
- **描述**: 学生选择课程
- **权限**: 学生权限

## 知识图谱管理 API

### 获取知识图谱数据

- **URL**: `GET /courses/{courseId}/knowledge-graph`
- **参数**: `courseId` - 课程ID
- **响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "nodes": [
      {
        "id": "知识点ID",
        "name": "知识点名称",
        "type": "knowledgePoint",
        "description": "知识点描述",
        "masteryLevel": "weak|medium|strong",
        "masteryScore": 65.5,
        "questionCount": 15,
        "difficulty": "EASY|MEDIUM|HARD",
        "estimatedStudyTime": 120
      }
    ],
    "edges": [
      {
        "id": "关系ID",
        "source": "源知识点ID",
        "target": "目标知识点ID",
        "type": "PREREQUISITE|INCLUDE|RELATED",
        "strength": "weak|medium|strong"
      }
    ]
  }
}
```

### 知识点管理

#### 创建知识点

- **URL**: `POST /courses/{courseId}/knowledge-points`
- **请求体**:

```json
{
  "pointName": "string, required, 知识点名称",
  "description": "string, required, 知识点描述",
  "difficulty": "EASY|MEDIUM|HARD",
  "estimatedStudyTime": 120,
  "parentPointId": "number, optional, 父知识点ID"
}
```

#### 更新知识点

- **URL**: `PUT /knowledge-points/{pointId}`
- **描述**: 更新知识点信息

#### 删除知识点

- **URL**: `DELETE /knowledge-points/{pointId}`
- **描述**: 删除知识点（需无关联数据）

### 知识点关系管理

#### 创建关系

- **URL**: `POST /knowledge-relations`
- **请求体**:

```json
{
  "sourcePoint": {"pointId": 1},
  "targetPoint": {"pointId": 2},
  "relationType": "PREREQUISITE|INCLUDE|RELATED",
  "strength": "weak|medium|strong"
}
```

## 用户数据管理 API

### 成绩管理

#### 批量导入成绩

- **URL**: `POST /user/scores/batch`
- **描述**: 批量导入用户成绩数据
- **请求体**:

```json
[
  {
    "scoreValue": 85.0,
    "examDate": "2024-01-15",
    "knowledgePoint": {"pointId": 1},
    "examType": "QUIZ|MIDTERM|FINAL",
    "weight": 0.3,
    "comment": "string, optional, 备注"
  }
]
```

#### 获取用户成绩

- **URL**: `GET /user/scores`
- **参数**:
  - `courseId`: number, optional, 课程ID
  - `startDate`: string, optional, 开始日期 (yyyy-MM-dd)
  - `endDate`: string, optional, 结束日期 (yyyy-MM-dd)
  - `pointId`: number, optional, 知识点ID

### 学习进度

#### 获取学习进度

- **URL**: `GET /user/learning-progress`
- **参数**: `courseId` - 课程ID
- **响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPoints": 50,
    "completedPoints": 30,
    "masteredPoints": 20,
    "progressPercentage": 60.0,
    "estimatedCompletionTime": "2周",
    "recentActivity": [
      {
        "date": "2024-01-15",
        "studyTime": 120,
        "completedPoints": 3
      }
    ]
  }
}
```

#### 获取薄弱知识点

- **URL**: `GET /user/weak-points`
- **参数**: `courseId` - 课程ID
- **响应**: 掌握程度为"weak"的知识点列表及改进建议

## 笔记管理 API

### 获取用户笔记

- **URL**: `GET /user/knowledge-points/{pointId}/user-note`
- **参数**: `pointId` - 知识点ID
- **响应**: 用户在该知识点的笔记信息

### 创建/更新笔记

- **URL**: `PUT /user/knowledge-points/{pointId}/user-note`
- **描述**: 创建或更新知识点笔记
- **请求体**:

```json
{
  "content": "string, required, 笔记内容",
  "attachments": [
    {
      "fileName": "string, required, 文件名",
      "fileData": "string, required, base64编码文件数据"
    }
  ]
}
```

### 删除笔记附件

- **URL**: `DELETE /user-notes/{noteId}/attachments/{attachmentId}`
- **描述**: 删除笔记中的附件

## 测验管理 API

### 获取随机题目

- **URL**: `GET /quiz/questions/random`
- **参数**:
  - `pointId`: number, optional, 知识点ID
  - `count`: number, optional, 题目数量 (默认5, 最大20)
  - `difficulty`: string, optional, 难度级别
  - `questionTypes`: string, optional, 题目类型筛选
- **响应**: 随机生成的题目列表

### 提交测验答案

- **URL**: `POST /quiz/attempt`
- **请求体**:

```json
{
  "pointId": 1,
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "A",
      "timeSpent": 30
    }
  ]
}
```

### 获取测验历史

- **URL**: `GET /quiz/attempts/history`
- **参数**:
  - `pointId`: number, optional, 知识点ID
  - `page`: number, optional, 页码
  - `size`: number, optional, 每页大小
- **响应**: 分页的测验记录

### 获取错题本

- **URL**: `GET /quiz/wrong-questions`
- **参数**: `courseId` - 课程ID
- **响应**: 用户的错题集合，包含详细解析

## 文件管理 API

### 上传文件

- **URL**: `POST /files/upload`
- **Content-Type**: `multipart/form-data`
- **限制**: 单个文件最大10MB
- **请求体**: 文件表单数据
- **响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "fileId": 1,
    "fileName": "document.pdf",
    "fileUrl": "/files/1.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf"
  }
}
```

## 统计分析 API

### 学习数据统计

- **URL**: `GET /analytics/learning-stats`
- **参数**: `courseId` - 课程ID
- **响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "studyTime": {
      "totalMinutes": 1250,
      "dailyAverage": 89,
      "trend": "increasing|decreasing|stable",
      "weeklyDistribution": [120, 90, 150, 80, 130, 60, 100]
    },
    "quizPerformance": {
      "averageScore": 78.5,
      "completionRate": 85.2,
      "improvement": 12.3,
      "accuracyByType": {
        "SINGLE_CHOICE": 82.1,
        "MULTIPLE_CHOICE": 75.3
      }
    },
    "knowledgeMastery": {
      "mastered": 15,
      "learning": 20,
      "weak": 5,
      "distribution": [15, 20, 5]
    }
  }
}
```

## 错误码说明

### HTTP 状态码

| 状态码 | 说明      |
|:----|:--------|
| 200 | 请求成功    |
| 400 | 请求参数错误  |
| 401 | 未授权访问   |
| 403 | 禁止访问    |
| 404 | 资源不存在   |
| 500 | 服务器内部错误 |

### 业务错误码

| 错误码  | 说明       |
|:-----|:---------|
| 1001 | 用户名或密码错误 |
| 1002 | 令牌已过期    |
| 1003 | 令牌无效     |
| 1004 | 用户不存在    |
| 2001 | 课程不存在    |
| 2002 | 知识点不存在   |
| 2003 | 课程关系冲突   |
| 3001 | 测验提交失败   |
| 3002 | 题目不存在    |
| 4001 | 文件上传失败   |
| 4002 | 文件大小超限   |
| 5001 | 数据格式错误   |

## 注意事项

### 通用规范

1. 所有时间格式使用 ISO 8601 标准
2. 分页参数 page 从 0 开始
3. 列表查询支持排序参数 sort
4. 金额和分数使用 BigDecimal 类型

### 安全要求

1. 敏感操作需要二次确认
2. 文件上传需要类型检查
3. 批量操作需要数量限制
4. 重要操作需要日志记录

### 性能建议

1. 列表接口必须支持分页
2. 复杂查询需要数据库索引优化
3. 频繁访问的数据建议缓存
4. 大文件上传需要进度提示
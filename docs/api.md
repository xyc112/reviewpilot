# API接口文档

## 概述

ReviewPilot后端提供RESTful API接口，基于Spring Boot框架开发，使用MySQL数据库。

**基础信息**

- 基础URL: `http://localhost:8080/api`
- 数据格式: JSON
- 认证方式: 暂未实现（开发阶段使用默认用户ID=1）

## 课程管理 API

### 获取所有课程

- **URL**: `GET /courses`
- **描述**: 获取系统中所有课程列表
- **响应**:

```json
[
  {
    "courseId": 1,
    "courseName": "人机交互",
    "syllabus": "课程描述..."
  }
]
```

### 获取课程详情

- **URL**: `GET /courses/{courseId}`
- **参数**: `courseId` - 课程ID
- **响应**: 课程详细信息

### 创建课程

- **URL**: `POST /courses`
- **请求体**:

```json
{
  "courseName": "新课程",
  "syllabus": "课程描述"
}
```

## 知识图谱管理 API

### 获取知识图谱数据

- **URL**: `GET /courses/{courseId}/knowledge-graph`
- **参数**:
  - `courseId` - 课程ID
  - `userId` - 用户ID（可选，默认1）
- **响应**:

```json
{
  "nodes": [
    {
      "id": "1",
      "name": "知识点名称",
      "type": "knowledgePoint",
      "description": "知识点描述",
      "masteryLevel": "weak",
      "masteryScore": 65.5
    }
  ],
  "edges": [
    {
      "id": "1",
      "source": "1",
      "target": "2",
      "type": "PREREQUISITE"
    }
  ]
}
```

### 创建知识点

- **URL**: `POST /courses/{courseId}/knowledge-points`
- **请求体**:

```json
{
  "pointName": "新知识点",
  "description": "知识点描述"
}
```

### 创建知识点关系

- **URL**: `POST /knowledge-relations`
- **请求体**:

```json
{
  "sourcePoint": {"pointId": 1},
  "targetPoint": {"pointId": 2},
  "relationType": "PREREQUISITE"
}
```

## 用户数据管理 API

### 批量导入成绩

- **URL**: `POST /user/scores/batch`
- **请求体**:

```json
[
  {
    "scoreValue": 85.0,
    "examDate": "2024-01-15",
    "user": {"userId": 1},
    "knowledgePoint": {"pointId": 1}
  }
]
```

### 获取用户成绩

- **URL**: `GET /user/scores`
- **参数**:
  - `courseId` - 课程ID
  - `userId` - 用户ID（可选，默认1）
- **响应**: 用户成绩列表

### 获取薄弱知识点

- **URL**: `GET /user/weak-points`
- **参数**:
  - `courseId` - 课程ID
  - `userId` - 用户ID（可选，默认1）
- **响应**:

```json
[
  {
    "pointId": 1,
    "pointName": "知识点名称",
    "masteryLevel": "weak",
    "averageScore": 65.5
  }
]
```

## 笔记管理 API

### 获取用户笔记

- **URL**: `GET /user/knowledge-points/{pointId}/user-note`
- **参数**:
  - `pointId` - 知识点ID
  - `userId` - 用户ID（可选，默认1）
- **响应**: 用户笔记内容

### 创建/更新笔记

- **URL**: `PUT /user/knowledge-points/{pointId}/user-note`
- **参数**:
  - `pointId` - 知识点ID
  - `userId` - 用户ID（可选，默认1）
- **请求体**:

```json
{
  "content": "笔记内容...",
  "attachments": "[]"
}
```

## 测验管理 API

### 获取随机题目

- **URL**: `GET /quiz/questions/random`
- **参数**:
  - `pointId` - 知识点ID
  - `count` - 题目数量（可选，默认5）
  - `userId` - 用户ID（可选，默认1）
- **响应**:

```json
[
  {
    "questionId": 1,
    "questionText": "题目内容",
    "options": "[\"选项A\", \"选项B\", \"选项C\"]",
    "correctAnswer": "A"
  }
]
```

### 提交测验答案

- **URL**: `POST /quiz/attempt`
- **参数**: `userId` - 用户ID（可选，默认1）
- **请求体**:

```json
{
  "pointId": 1,
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "A"
    }
  ]
}
```

- **响应**:

```json
{
  "totalScore": 80.0,
  "correctCount": 4,
  "totalQuestions": 5,
  "details": [
    {
      "questionId": 1,
      "isCorrect": true,
      "correctAnswer": "A",
      "selectedAnswer": "A"
    }
  ]
}
```

### 获取测验历史

- **URL**: `GET /quiz/attempts/history`
- **参数**:
  - `pointId` - 知识点ID（可选）
  - `userId` - 用户ID（可选，默认1）
- **响应**: 测验记录列表

## 错误响应格式

```json
{
  "error": "错误描述信息"
}
```
# 一、认证模块

## 概述

本系统提供基于JWT的认证机制，支持用户（USER）和管理员（ADMIN）两种角色。

## 1.用户注册

**EndPoint**: ```POST /api/auth/register```

**描述**: 注册新用户

**请求头**: ```Content-Type: application/json```

**请求体**:

```json
{
  "username": "string, 必填, 用户名",
  "password": "string, 必填, 密码",
  "role": "string, 可选, 角色类型: USER 或 ADMIN，默认为 USER"
}
```

**示例请求**:

注册普通用户

```json
{
  "username": "testuser",
  "password": "123456"
}
```

注册管理员用户

```json
{
  "username": "admin",
  "password": "123456",
  "role": "ADMIN"
}
```

**成功响应（200）**

```json
{
  "token": "JWT令牌字符串",
  "username": "注册的用户名",
  "role": "USER 或 ADMIN"
}
```

**错误情况**

```json
{
  "status": 409,
  "error": "用户名已存在: testuser",
  "timestamp": "2025-10-28T17:30:45.123"
}
```

## 2.用户登录

**EndPoint**: ```POST /api/auth/login```

**描述**: 用户登录获取JWT令牌

**请求头**: ```Content-Type: application/json```

**请求体**:

```json
{
  "username": "string, 必填, 用户名",
  "password": "string, 必填, 密码"
}
```

**示例请求**:

```json
{
  "username": "testuser",
  "password": "123456"
}
```

**成功响应（200）**

```json
{
  "token": "JWT令牌字符串",
  "username": "注册的用户名",
  "role": "USER 或 ADMIN"
}
```

**错误情况**

```json
{
  "status": 401,
  "error": "用户名或密码错误",
  "timestamp": "2025-10-28T17:28:56.8649285"
}
```

# 二、课程模块

## 概述

所有课程接口均需携带 JWT，HTTP 头 `Authorization: Bearer <token>`。角色 `ADMIN` 可管理所有课程，课程创建者（authorId）可管理自己课程，普通
`USER` 仅可读取。

## 1. 列出课程

**EndPoint**: ```GET /api/courses```

**描述**: 返回所有课程（不分页，Demo 用）。支持按标题/描述或标签过滤。

**请求头**: ```Authorization: Bearer <token>```

**成功响应（200）**

```json
[
  {
    "id": 123,
    "title": "线性代数入门",
    "description": "矩阵与向量基础",
    "tags": [
      "数学",
      "线代"
    ],
    "level": "BEGINNER",
    "authorId": 10,
    "createdAt": "2025-10-28T12:00:00Z"
  }
]
```

**错误情况**

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or missing token",
  "timestamp": "..."
}
```

## 2. 获取课程详情

**EndPoint**: `GET /api/courses/{id}`

**描述**：返回课程完整信息，包含 syllabus（章节/单元列表）和 authorId。

**请求头**： `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "id": 123,
  "title": "线性代数入门",
  "description": "矩阵与向量基础",
  "tags": [
    "数学",
    "线代"
  ],
  "level": "BEGINNER",
  "authorId": 10,
  "createdAt": "2025-10-28T12:00:00Z"
}

```

**错误情况**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Course not found",
  "timestamp": "..."
}
```

## 3. 创建课程

**EndPoint**: `POST /api/courses`

**描述**：返回课程完整信息，包含authorId。

**请求头**： `Content-Type: application/json`以及`Authorization: Bearer <token>`

**成功响应（201）**

```json
{
  "title": "字符串，必填",
  "description": "字符串，可选",
  "tags": [
    "string"
  ],
  "level": "BEGINNER|INTERMEDIATE|ADVANCED"
}
```

**错误情况**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "title is required",
  "timestamp": "..."
}
```

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Course title already exists",
  "timestamp": "..."
}
```

## 4. 更新课程

**EndPoint**: `PUT /api/courses/{courseId}`

**权限**: `ADMIN`或课程作者

**请求头**： `Content-Type: application/json`以及`Authorization: Bearer <token>`

**请求体**：与创建相同（字段可部分提供）

**成功响应（200）**

```json
{
  "id": 123,
  "title": "线性代数入门（更新）",
  "updatedAt": "2025-10-28T13:30:00Z"
}
```

**错误情况**

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Not course owner or admin",
  "timestamp": "..."
}
```

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Course not found",
  "timestamp": "..."
}
```

## 5. 删除课程

**EndPoint**: `DELETE /api/courses/{courseId}`

**权限**: `ADMIN`或课程作者

**请求头**： `Authorization: Bearer <token>`

**成功响应（204）**

**错误情况**

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Not course owner or admin",
  "timestamp": "..."
}
```

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Course not found",
  "timestamp": "..."
}
```

# 三、知识图谱模块

## 概述

仅保留手动管理节点与关系的接口。所有接口必须携带 JWT，HTTP 头 `Authorization: Bearer <token>`。写操作仅限 `ADMIN`
或课程作者（课程对象含 `authorId`），普通 `USER` 仅可读取。

数据模型（必要字段）

- Node
    - `id` string（服务器生成）
    - `label` string 必填
    - `type` string 可选（如 `concept|topic`）
    - `description` string 可选
    - `meta` object 可选（键值对）
- Relation
    - `id` string（服务器生成）
    - `from` string （node id，必填）
    - `to` string （node id，必填）
    - `type` string 必填（如 `prerequisite|related|part_of`）
    - `directed` boolean 默认 `true`
    - `weight` number 0..1 可选
    - `meta` object 可选

通用约定

- `Content-Type: application/json`
- 写操作返回创建或更新后的完整对象；删除成功返回 `204`。
- 常见错误：`401` 未认证、`403` 无权限、`400` 参数校验、`404` 未找到、`409` 冲突（重复或引用）。

## 1. 列出课程下所有节点

**EndPoint**: ```GET /api/graphs/{courseId}/nodes```

**描述**: 返回该课程全部节点（不分页）。

**请求头**: ```Authorization: Bearer <token>```

**成功响应（200）**

```json
[
  {
    "id": "n1",
    "label": "矩阵",
    "type": "concept",
    "description": "定义简介",
    "meta": {}
  },
  {
    "id": "n2",
    "label": "行列式",
    "type": "concept"
  }
]
```

## 2. 获取单个节点

**EndPoint**: ```GET /api/graphs/{courseId}/nodes/{nodeId}```

**描述**: 返回节点详细信息及入/出度计数。

**成功响应（200）**

```json
[
  {
    "id": "n1",
    "label": "矩阵",
    "type": "concept",
    "description": "定义简介",
    "meta": {}
  },
  {
    "id": "n2",
    "label": "行列式",
    "type": "concept"
  }
]
```

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Node not found",
  "timestamp": "2025-10-28T17:30:00Z"
}
```

## 3. 创建节点

**EndPoint**: ```POST /api/graphs/{courseId}/nodes```

**权限**: `ADMIN` 或 课程作者

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**

```json
{
  "label": "向量空间",
  "type": "concept",
  "description": "手动添加的节点",
  "meta": {
    "syllabusRef": "chapter-2"
  }
}
```

**成功响应（201）**

```json
{
  "id": "n10",
  "label": "向量空间",
  "type": "concept",
  "description": "手动添加的节点",
  "meta": {
    "syllabusRef": "chapter-2"
  }
}
```

**错误示例**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "label is required",
  "timestamp": "..."
}
```

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Node with same label exists",
  "timestamp": "..."
}
```

## 4. 更新节点

**EndPoint**: ```PUT /api/graphs/{courseId}/nodes/{nodeId}```

**权限**: `ADMIN` 或 课程作者

**请求体**:与创建相同（字段可部分提供）

```json
{
  "label": "向量空间",
  "type": "concept",
  "description": "手动添加的节点",
  "meta": {
    "syllabusRef": "chapter-2"
  }
}
```

**成功响应（200）**

```json
{
  "id": "n1",
  "label": "矩阵（更新）",
  "type": "concept",
  "description": "更新后的描述"
}
```

**错误示例**

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Not course owner or admin",
  "timestamp": "..."
}
```

## 5. 删除节点

**EndPoint**: ```DELETE /api/graphs/{courseId}/nodes/{nodeId}```

**权限**: `ADMIN` 或 课程作者

**行为**: 若节点被关系引用返回 409。

**成功响应（204）**

**错误示例**

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Node is referenced by relations",
  "timestamp": "..."
}
```

## 6. 列出关系

**EndPoint**: ```GET /api/graphs/{courseId}/relations```

**描述**: 返回该课程全部关系。

**查询参数**:

```text
from   可选，按起始节点 id 过滤
to     可选，按目标节点 id 过滤
type   可选，关系类型过滤
```

**成功响应（200）**

```json
[
  {
    "id": "r1",
    "from": "n1",
    "to": "n2",
    "type": "prerequisite",
    "directed": true,
    "weight": 0.8,
    "meta": {}
  }
]
```

## 7. 创建关系

**EndPoint**: ```POST /api/graphs/{courseId}/relations```

**权限**: `ADMIN` 或 课程作者

**请求体**

```json
{
  "from": "n1",
  "to": "n2",
  "type": "prerequisite",
  "directed": true,
  "weight": 0.8,
  "meta": {}
}
```

**成功响应（201）**

```json
{
  "id": "r10",
  "from": "n1",
  "to": "n2",
  "type": "prerequisite",
  "directed": true,
  "weight": 0.8
}

```

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Source or target node not found",
  "timestamp": "..."
}
```

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Relation already exists",
  "timestamp": "..."
}
```

## 8. 更新关系

**EndPoint**: ```PUT /api/graphs/{courseId}/relations/{relationId}```

**权限**: `ADMIN` 或 课程作者

**请求体**：可更新字段 type,directed,weight,meta

**成功响应（200）**

```json
{
  "id":"r1",
  "from":"n1",
  "to":"n2",
  "type":"related",
  "weight":0.5
}
```

## 9. 删除关系

**EndPoint**: ```DELETE /api/graphs/{courseId}/relations/{relationId}```

**权限**: `ADMIN` 或 课程作者

**成功响应（204）** 无内容

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Relation not found",
  "timestamp": "..."
}
```

# 四、笔记模块

## 概述

笔记与课程关联，支持用户对课程做私有或公开笔记。所有接口必须携带 JWT，HTTP 头 `Authorization: Bearer <token>`。笔记创建者或 `ADMIN` 可修改/删除自己的笔记；课程作者对课程笔记不默认拥有管理权限（除非是笔记创建者或 ADMIN）。普通 `USER` 可读取公开笔记和自己私有笔记。

数据模型（必要字段）
- Note
  - id string（服务器生成）
  - courseId number 必填
  - title string 必填
  - content string 必填（文本或 markdown）
  - authorId number（创建者用户 id）
  - visibility string 可选（"public" | "private"，默认 "private"）
  - createdAt string
  - updatedAt string 可选

通用约定
- `Content-Type: application/json`
- 写操作返回创建或更新后的完整对象；删除成功返回 `204`。
- 常见错误：`401` 未认证、`403` 无权限、`400` 参数校验、`404` 未找到、`409` 冲突。

## 1. 列出课程下所有笔记

**EndPoint**: `GET /api/courses/{courseId}/notes`

**描述**: 返回该课程全部公开笔记及当前用户自己的私有笔记（不分页，Demo 用）。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**
```json
[
  {
    "id": "note1",
    "courseId": 123,
    "title": "章节1要点",
    "content": "这是笔记内容，支持 markdown",
    "authorId": 45,
    "visibility": "public",
    "createdAt": "2025-10-28T12:00:00Z"
  }
]
```

## 2. 获取单个笔记

**EndPoint**: `GET /api/courses/{courseId}/notes/{noteId}`

**描述**: 返回笔记详细信息。私有笔记仅对作者和 ADMIN 可见。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "id": "note1",
  "courseId": 123,
  "title": "章节1要点",
  "content": "详细内容",
  "authorId": 45,
  "visibility": "private",
  "createdAt": "2025-10-28T12:00:00Z"
}
```

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Note not found",
  "timestamp": "..."
}
```

## 3. 创建笔记

**EndPoint**: `POST /api/courses/{courseId}/notes`

**权限**: 任何已认证用户可创建笔记（创建者为笔记 authorId）

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**

```json
{
  "title": "我的笔记标题",
  "content": "笔记内容，支持 markdown",
  "visibility": "public"
}
```

**成功响应（201）**

```json
{
  "id": "note10",
  "courseId": 123,
  "title": "我的笔记标题",
  "content": "笔记内容",
  "authorId": 45,
  "visibility": "public",
  "createdAt": "2025-10-28T13:00:00Z"
}
```

**错误示例**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "title and content are required",
  "timestamp": "..."
}
```

## 4. 更新笔记

**EndPoint**: `PUT /api/courses/{courseId}/notes/{noteId}`

**权限**: 笔记作者或 `ADMIN`

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**：字段可部分提供
```json
{
  "title": "更新后的标题",
  "content": "更新内容",
  "visibility": "private"
}
```

**成功响应（200）**

```json
{
  "id": "note1",
  "title": "更新后的标题",
  "updatedAt": "2025-10-28T14:00:00Z"
}
```

**错误示例**

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Not note owner or admin",
  "timestamp": "..."
}
```

## 5. 删除笔记

**EndPoint**: `DELETE /api/courses/{courseId}/notes/{noteId}`

**权限**: 笔记作者或 `ADMIN`

**请求头**: `Authorization: Bearer <token>`

**成功响应（204）**

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Note not found",
  "timestamp": "..."
}
```

# 五、测验模块

## 概述

测验（Quiz）与课程关联，包含若干题目（单选/多选/简答）。所有接口必须携带 JWT，HTTP 头 `Authorization: Bearer <token>`。创建/更新/删除操作仅限 `ADMIN` 或课程作者。普通 `USER` 可读取测验并提交答卷。答卷提交返回自动评分结果（只对选择题自动评分，简答题返回待评分状态）。

数据模型（必要字段）
- Quiz
  - id string（服务器生成）
  - courseId number 必填
  - title string 必填
  - questions array
    - id string（服务器生成）
    - type string 必填（"single"|"multiple"|"short"）
    - question string 必填
    - options array 可选（选择题）
    - answer array 可选（服务端保留，仅在创建/更新或管理员/作者视图返回）
  - authorId number
  - createdAt string

通用约定
- `Content-Type: application/json`
- 写操作返回创建或更新后的完整对象；删除成功返回 `204`。
- 常见错误：`401` 未认证、`403` 无权限、`400` 参数校验、`404` 未找到、`409` 冲突。

## 1. 列出课程下所有测验

**EndPoint**: `GET /api/courses/{courseId}/quizzes`

**描述**: 返回该课程全部测验（不分页）。普通用户不会看到题目的答案字段。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**
```json
[
  {
    "id": "q1",
    "courseId": 123,
    "title": "第1章小测验",
    "authorId": 10,
    "createdAt": "2025-10-28T12:00:00Z"
  }
]
```

## 2. 获取测验详情

**EndPoint**: `GET /api/courses/{courseId}/quizzes/{quizId}`

**描述**: 返回测验完整信息。普通用户视图不包含正确答案字段（answer）；作者或 ADMIN 可见正确答案。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200，普通用户示例）**

```json
{
  "id": "q1",
  "courseId": 123,
  "title": "第1章小测验",
  "questions": [
    {
      "id": "q1-1",
      "type": "single",
      "question": "下面哪个是向量的定义？",
      "options": ["A","B","C"]
    }
  ],
  "createdAt": "2025-10-28T12:00:00Z"
}
```

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Quiz not found",
  "timestamp": "..."
}
```

## 3. 创建测验

**EndPoint**: `POST /api/courses/{courseId}/quizzes`

**权限**: `ADMIN` 或课程作者

**请求头**: `Content-Type: application/json` 及 `Authorization: Bearer <token>`

**请求体**

```json
{
  "title": "第1章小测验",
  "questions": [
    {
      "type": "single",
      "question": "题干",
      "options": ["A","B","C"],
      "answer": [1]
    }
  ]
}
```

**成功响应（201）**

```json
{
  "id": "q10",
  "courseId": 123,
  "title": "第1章小测验",
  "questions": [
    {
      "id": "q10-1",
      "type": "single",
      "question": "题干",
      "options": ["A","B","C"],
      "answer": [1]
    }
  ],
  "authorId": 10,
  "createdAt": "2025-10-28T13:00:00Z"
}
```

**错误示例**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "title and questions are required",
  "timestamp": "..."
}
```

## 4. 更新测验

**EndPoint**: `PUT /api/courses/{courseId}/quizzes/{quizId}`

**权限**: `ADMIN` 或课程作者

**请求头**: `Content-Type: application/json` 及 `Authorization: Bearer <token>`

**请求体（字段可部分提供）**

```json
{
  "title": "更新标题",
  "questions": [
    {
      "id": "q10-1",
      "type": "single",
      "question": "更新题干",
      "options": ["A","B","C"],
      "answer": [2]
    }
  ]
}
```

**成功响应（200）**

```json
{
  "id": "q1",
  "title": "更新标题",
  "updatedAt": "2025-10-28T14:00:00Z"
}
```

**错误示例**

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Not quiz owner or admin",
  "timestamp": "..."
}
```

## 5. 删除测验

**EndPoint**: `DELETE /api/courses/{courseId}/quizzes/{quizId}`

**权限**: `ADMIN` 或课程作者

**请求头**: `Authorization: Bearer <token>`

**成功响应（204）**

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Quiz not found",
  "timestamp": "..."
}
```

## 6. 提交答卷

**EndPoint**: `POST /api/courses/{courseId}/quizzes/{quizId}/attempts`

**描述**: 学生提交答题；自动评分。

**请求头**: `Content-Type: application/json` 及 `Authorization: Bearer <token>`

**请求体**

```json
{
  "answers": [
    { "questionId": "q1-1", "answer": [1] }
  ]
}
```

**成功响应（200）**

```json
{
  "quizId": "q1",
  "userId": 45,
  "score": 80,
  "total": 100,
  "results": [
    {
      "questionId": "q1-1",
      "correct": true,
      "score": 50
    }
  ],
  "submittedAt": "2025-10-28T15:00:00Z"
}
```

**错误示例**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "answers format invalid",
  "timestamp": "..."
}
```

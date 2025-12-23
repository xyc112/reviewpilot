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

# 六、社区模块

## 概述

社区模块提供课程相关的帖子（Post）和评论（Comment）功能。所有接口必须携带 JWT，HTTP 头 `Authorization: Bearer <token>`。帖子/评论的创建者或 `ADMIN` 可修改/删除自己的内容。

数据模型（必要字段）
- Post
  - id number（服务器生成）
  - courseId number 必填
  - authorId number（创建者用户 id）
  - title string 必填
  - content string 必填（支持 Markdown）
  - createdAt string
  - updatedAt string 可选
- Comment
  - id number（服务器生成）
  - postId number 必填
  - authorId number（创建者用户 id）
  - content string 必填（支持 Markdown）
  - parentId number 可选（用于回复评论，形成嵌套结构）
  - createdAt string
  - updatedAt string 可选

通用约定
- `Content-Type: application/json`
- 写操作返回创建或更新后的完整对象；删除成功返回 `204`。
- 常见错误：`401` 未认证、`403` 无权限、`400` 参数校验、`404` 未找到。

## 1. 列出课程下的所有帖子

**EndPoint**: `GET /api/courses/{courseId}/posts`

**描述**: 返回该课程全部帖子（不分页）。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
[
  {
    "id": 1,
    "courseId": 123,
    "authorId": 45,
    "authorUsername": "张三",
    "title": "Java多态问题",
    "content": "最近在学习Java的面向对象编程...",
    "createdAt": "2025-11-19T10:30:00Z",
    "updatedAt": "2025-11-19T10:30:00Z"
  }
]
```

## 2. 获取单个帖子

**EndPoint**: `GET /api/courses/{courseId}/posts/{postId}`

**描述**: 返回帖子详细信息。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "id": 1,
  "courseId": 123,
  "authorId": 45,
  "authorUsername": "张三",
  "title": "Java多态问题",
  "content": "详细内容...",
  "createdAt": "2025-11-19T10:30:00Z",
  "updatedAt": "2025-11-19T10:30:00Z"
}
```

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Post not found",
  "timestamp": "..."
}
```

## 3. 创建帖子

**EndPoint**: `POST /api/courses/{courseId}/posts`

**权限**: 任何已认证用户可创建帖子

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**

```json
{
  "title": "我的问题标题",
  "content": "帖子内容，支持 Markdown 格式"
}
```

**成功响应（201）**

```json
{
  "id": 10,
  "courseId": 123,
  "authorId": 45,
  "authorUsername": "张三",
  "title": "我的问题标题",
  "content": "帖子内容",
  "createdAt": "2025-11-19T13:00:00Z"
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

## 4. 更新帖子

**EndPoint**: `PUT /api/courses/{courseId}/posts/{postId}`

**权限**: 帖子作者或 `ADMIN`

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**：字段可部分提供

```json
{
  "title": "更新后的标题",
  "content": "更新内容"
}
```

**成功响应（200）**

```json
{
  "id": 1,
  "title": "更新后的标题",
  "updatedAt": "2025-11-19T14:00:00Z"
}
```

**错误示例**

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Not post owner or admin",
  "timestamp": "..."
}
```

## 5. 删除帖子

**EndPoint**: `DELETE /api/courses/{courseId}/posts/{postId}`

**权限**: 帖子作者或 `ADMIN`

**请求头**: `Authorization: Bearer <token>`

**成功响应（204）**

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Post not found",
  "timestamp": "..."
}
```

## 6. 列出帖子下的所有评论

**EndPoint**: `GET /api/courses/{courseId}/posts/{postId}/comments`

**描述**: 返回该帖子全部评论（包括嵌套回复）。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
[
  {
    "id": 1,
    "postId": 1,
    "authorId": 46,
    "authorUsername": "李四",
    "content": "这是一个评论",
    "parentId": null,
    "createdAt": "2025-11-19T11:00:00Z",
    "updatedAt": "2025-11-19T11:00:00Z"
  },
  {
    "id": 2,
    "postId": 1,
    "authorId": 45,
    "authorUsername": "张三",
    "content": "回复评论",
    "parentId": 1,
    "createdAt": "2025-11-19T11:30:00Z",
    "updatedAt": "2025-11-19T11:30:00Z"
  }
]
```

## 7. 获取单个评论

**EndPoint**: `GET /api/courses/{courseId}/posts/{postId}/comments/{commentId}`

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "id": 1,
  "postId": 1,
  "authorId": 46,
  "authorUsername": "李四",
  "content": "评论内容",
  "parentId": null,
  "createdAt": "2025-11-19T11:00:00Z"
}
```

## 8. 创建评论

**EndPoint**: `POST /api/courses/{courseId}/posts/{postId}/comments`

**权限**: 任何已认证用户可创建评论

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**

```json
{
  "content": "评论内容，支持 Markdown",
  "parentId": 1
}
```

**说明**: `parentId` 可选，如果提供则表示回复某个评论，形成嵌套结构。

**成功响应（201）**

```json
{
  "id": 10,
  "postId": 1,
  "authorId": 45,
  "authorUsername": "张三",
  "content": "评论内容",
  "parentId": 1,
  "createdAt": "2025-11-19T13:00:00Z"
}
```

**错误示例**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "content is required",
  "timestamp": "..."
}
```

## 9. 更新评论

**EndPoint**: `PUT /api/courses/{courseId}/posts/{postId}/comments/{commentId}`

**权限**: 评论作者或 `ADMIN`

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**：字段可部分提供

```json
{
  "content": "更新后的评论内容"
}
```

**成功响应（200）**

```json
{
  "id": 1,
  "content": "更新后的评论内容",
  "updatedAt": "2025-11-19T14:00:00Z"
}
```

## 10. 删除评论

**EndPoint**: `DELETE /api/courses/{courseId}/posts/{postId}/comments/{commentId}`

**权限**: 评论作者或 `ADMIN`

**请求头**: `Authorization: Bearer <token>`

**成功响应（204）**

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Comment not found",
  "timestamp": "..."
}
```

# 七、复习计划模块

## 概述

复习计划模块允许用户创建和管理学习计划及考试安排。所有接口必须携带 JWT，HTTP 头 `Authorization: Bearer <token>`。用户只能管理自己的复习计划。

数据模型（必要字段）
- ReviewPlan
  - id number（服务器生成）
  - userId number（用户 id）
  - planDate string 必填（日期格式：YYYY-MM-DD）
  - title string 必填
  - description string 可选
  - type string 必填（"plan" | "exam"）
  - completed boolean 默认 false
  - createdAt string
  - updatedAt string 可选

通用约定
- `Content-Type: application/json`
- 写操作返回创建或更新后的完整对象；删除成功返回 `204`。
- 常见错误：`401` 未认证、`403` 无权限、`400` 参数校验、`404` 未找到。

## 1. 列出用户的所有复习计划

**EndPoint**: `GET /api/review-plans`

**描述**: 返回当前用户的所有复习计划，按日期升序排列。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
[
  {
    "id": 1,
    "userId": 2,
    "planDate": "2025-12-25",
    "title": "复习Java基础语法",
    "description": "回顾变量、数据类型、控制结构等基础知识",
    "type": "plan",
    "completed": false,
    "createdAt": "2025-12-20T10:00:00Z",
    "updatedAt": "2025-12-20T10:00:00Z"
  }
]
```

## 2. 按日期范围获取复习计划

**EndPoint**: `GET /api/review-plans/date-range?startDate=2025-11-01&endDate=2025-12-31`

**描述**: 返回指定日期范围内的复习计划。

**请求头**: `Authorization: Bearer <token>`

**查询参数**:
- `startDate`: 必填，起始日期（ISO 8601 格式：YYYY-MM-DD）
- `endDate`: 必填，结束日期（ISO 8601 格式：YYYY-MM-DD）

**成功响应（200）**

```json
[
  {
    "id": 1,
    "planDate": "2025-12-25",
    "title": "复习Java基础语法",
    "type": "plan",
    "completed": false
  }
]
```

## 3. 按日期获取复习计划

**EndPoint**: `GET /api/review-plans/date/{date}`

**描述**: 返回指定日期的所有复习计划。

**请求头**: `Authorization: Bearer <token>`

**路径参数**:
- `date`: 日期（ISO 8601 格式：YYYY-MM-DD）

**成功响应（200）**

```json
[
  {
    "id": 1,
    "planDate": "2025-12-25",
    "title": "复习Java基础语法",
    "type": "plan",
    "completed": false
  }
]
```

## 4. 获取单个复习计划

**EndPoint**: `GET /api/review-plans/{id}`

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "id": 1,
  "userId": 2,
  "planDate": "2025-12-25",
  "title": "复习Java基础语法",
  "description": "回顾变量、数据类型、控制结构等基础知识",
  "type": "plan",
  "completed": false,
  "createdAt": "2025-12-20T10:00:00Z"
}
```

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Review plan not found",
  "timestamp": "..."
}
```

## 5. 创建复习计划

**EndPoint**: `POST /api/review-plans`

**权限**: 任何已认证用户可创建自己的复习计划

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**

```json
{
  "planDate": "2025-12-25",
  "title": "复习Java基础语法",
  "description": "回顾变量、数据类型、控制结构等基础知识",
  "type": "plan",
  "completed": false
}
```

**成功响应（201）**

```json
{
  "id": 10,
  "userId": 2,
  "planDate": "2025-12-25",
  "title": "复习Java基础语法",
  "description": "回顾变量、数据类型、控制结构等基础知识",
  "type": "plan",
  "completed": false,
  "createdAt": "2025-12-20T10:00:00Z"
}
```

**错误示例**

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
  "status": 400,
  "error": "Bad Request",
  "message": "planDate is required",
  "timestamp": "..."
}
```

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "type must be 'plan' or 'exam'",
  "timestamp": "..."
}
```

## 6. 更新复习计划

**EndPoint**: `PUT /api/review-plans/{id}`

**权限**: 计划所有者

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**：字段可部分提供

```json
{
  "title": "更新后的标题",
  "description": "更新后的描述",
  "planDate": "2025-12-26",
  "type": "exam",
  "completed": true
}
```

**成功响应（200）**

```json
{
  "id": 1,
  "title": "更新后的标题",
  "updatedAt": "2025-12-20T14:00:00Z"
}
```

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Review plan not found",
  "timestamp": "..."
}
```

## 7. 删除复习计划

**EndPoint**: `DELETE /api/review-plans/{id}`

**权限**: 计划所有者

**请求头**: `Authorization: Bearer <token>`

**成功响应（204）**

**错误示例**

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Review plan not found",
  "timestamp": "..."
}
```

# 八、学习进度模块

## 概述

学习进度模块记录用户的学习成果，包括测验完成情况和统计信息。所有接口必须携带 JWT，HTTP 头 `Authorization: Bearer <token>`。用户只能查看自己的学习进度。

数据模型
- Progress
  - id number（服务器生成）
  - userId number（用户 id）
  - courseId number 必填
  - quizId string 可选（如果为空则表示课程级别的统计）
  - score number 可选（0-100）
  - totalScore number 可选（通常为100）
  - completed boolean 必填
  - completedAt string 可选
  - lastAccessedAt string 可选

通用约定
- `Content-Type: application/json`
- 常见错误：`401` 未认证、`404` 未找到。

## 1. 获取总体学习统计

**EndPoint**: `GET /api/progress/overall`

**描述**: 返回用户的总体学习统计。如果用户设置了当前学习课程，则只统计该课程；否则统计所有选择的课程。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "totalCourses": 5,
  "completedCourses": 2,
  "totalQuizzes": 20,
  "completedQuizzes": 8,
  "averageScore": 85.5,
  "totalStudyTime": 3600
}
```

## 2. 获取所有课程的进度列表

**EndPoint**: `GET /api/progress/courses`

**描述**: 返回用户在所有课程的进度列表。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
[
  {
    "courseId": 1,
    "courseTitle": "Java 编程基础",
    "totalQuizzes": 3,
    "completedQuizzes": 2,
    "averageScore": 90.0,
    "completed": false
  }
]
```

## 3. 获取某门课程的详细进度

**EndPoint**: `GET /api/progress/courses/{courseId}`

**描述**: 返回用户在某门课程的详细进度。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "courseId": 1,
  "courseTitle": "Java 编程基础",
  "totalQuizzes": 3,
  "completedQuizzes": 2,
  "averageScore": 90.0,
  "completed": false,
  "quizProgress": [
    {
      "quizId": "quiz1",
      "quizTitle": "Java 数据类型与变量",
      "score": 95,
      "completed": true,
      "completedAt": "2025-11-18T10:00:00Z"
    }
  ]
}
```

# 九、错题模块

## 概述

错题模块允许用户收集和管理做错的题目，支持练习和掌握状态跟踪。所有接口必须携带 JWT，HTTP 头 `Authorization: Bearer <token>`。用户只能管理自己的错题。

数据模型（必要字段）
- WrongQuestion
  - id number（服务器生成）
  - userId number（用户 id）
  - courseId number 必填
  - questionId number 必填（题目 id）
  - quizId string 必填（测验 id）
  - userAnswer array 必填（用户答案，选项索引列表）
  - mastered boolean 默认 false
  - addedAt string
  - lastPracticedAt string 可选
  - practiceCount number 默认 0

通用约定
- `Content-Type: application/json`
- 写操作返回创建或更新后的完整对象；删除成功返回 `204`。
- 常见错误：`401` 未认证、`404` 未找到、`400` 参数校验。

## 1. 列出错题

**EndPoint**: `GET /api/courses/{courseId}/wrong-questions?mastered=false`

**描述**: 返回该课程的错题列表。可通过 `mastered` 参数过滤。

**请求头**: `Authorization: Bearer <token>`

**查询参数**:
- `mastered`: 可选，boolean，过滤已掌握/未掌握的错题

**成功响应（200）**

```json
[
  {
    "id": 1,
    "userId": 2,
    "courseId": 1,
    "questionId": 1,
    "quizId": "quiz1",
    "userAnswer": [0],
    "mastered": false,
    "addedAt": "2025-11-19T10:00:00Z",
    "lastPracticedAt": "2025-11-19T10:00:00Z",
    "practiceCount": 1
  }
]
```

## 2. 添加错题

**EndPoint**: `POST /api/courses/{courseId}/wrong-questions`

**权限**: 任何已认证用户可添加错题

**请求头**: `Content-Type: application/json` 以及 `Authorization: Bearer <token>`

**请求体**

```json
{
  "questionId": 1,
  "userAnswer": [0]
}
```

**成功响应（200）**

```json
{
  "id": 10,
  "userId": 2,
  "courseId": 1,
  "questionId": 1,
  "quizId": "quiz1",
  "userAnswer": [0],
  "mastered": false,
  "addedAt": "2025-11-19T13:00:00Z",
  "practiceCount": 0
}
```

## 3. 标记为已掌握

**EndPoint**: `PUT /api/courses/{courseId}/wrong-questions/{wrongQuestionId}/mastered`

**权限**: 错题所有者

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "id": 1,
  "mastered": true,
  "updatedAt": "2025-11-19T14:00:00Z"
}
```

## 4. 删除错题

**EndPoint**: `DELETE /api/courses/{courseId}/wrong-questions/{wrongQuestionId}`

**权限**: 错题所有者

**请求头**: `Authorization: Bearer <token>`

**成功响应（204）**

## 5. 练习错题（增加练习次数）

**EndPoint**: `POST /api/courses/{courseId}/wrong-questions/{wrongQuestionId}/practice`

**权限**: 错题所有者

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "id": 1,
  "practiceCount": 2,
  "lastPracticedAt": "2025-11-19T15:00:00Z"
}
```

## 6. 获取错题统计

**EndPoint**: `GET /api/courses/{courseId}/wrong-questions/stats`

**描述**: 返回该课程的错题统计信息。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "total": 10,
  "mastered": 3,
  "notMastered": 7
}
```

# 十、用户课程模块

## 概述

用户课程模块管理用户选择的课程和当前学习的课程。所有接口必须携带 JWT，HTTP 头 `Authorization: Bearer <token>`。用户只能管理自己的课程选择。

数据模型
- UserCourse
  - userId number（用户 id）
  - courseId number 必填
  - isCurrentStudying boolean 默认 false

通用约定
- `Content-Type: application/json`
- 常见错误：`401` 未认证、`404` 未找到。

## 1. 获取用户选择的所有课程

**EndPoint**: `GET /api/user-courses`

**描述**: 返回当前用户选择的所有课程。

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
[
  {
    "courseId": 1,
    "courseTitle": "Java 编程基础",
    "isCurrentStudying": true
  },
  {
    "courseId": 2,
    "courseTitle": "Spring Boot 实战",
    "isCurrentStudying": false
  }
]
```

## 2. 添加课程到学习列表

**EndPoint**: `POST /api/user-courses/{courseId}`

**权限**: 任何已认证用户

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

## 3. 从学习列表中移除课程

**EndPoint**: `DELETE /api/user-courses/{courseId}`

**权限**: 课程所有者

**请求头**: `Authorization: Bearer <token>`

**成功响应（204）`

## 4. 设置当前学习的课程

**EndPoint**: `PUT /api/user-courses/{courseId}/current-studying`

**权限**: 课程所有者

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

**说明**: 设置某个课程为当前学习课程，同一时间只能有一个当前学习课程。

## 5. 取消当前学习的课程

**EndPoint**: `DELETE /api/user-courses/current-studying`

**权限**: 课程所有者

**请求头**: `Authorization: Bearer <token>`

**成功响应（204）`

## 6. 获取当前学习的课程ID

**EndPoint**: `GET /api/user-courses/current-studying`

**请求头**: `Authorization: Bearer <token>`

**成功响应（200）**

```json
{
  "courseId": 1
}
```

**说明**: 如果没有当前学习课程，`courseId` 为 `null`。

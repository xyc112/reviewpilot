# Nexus 后端 API 文档

本文档描述 Nexus 学习平台后端 REST API 的请求与响应格式，便于前端集成。

---

## 文档约定

| 项目               | 说明                                             |
|------------------|------------------------------------------------|
| **Base URL**     | 由部署环境决定，例如 `http://localhost:8080`             |
| **认证**           | 除「认证模块」外，请求头需携带 `Authorization: Bearer <JWT>`  |
| **Content-Type** | 请求体为 JSON 时使用 `Content-Type: application/json` |
| **日期时间**         | 服务端返回 ISO-8601 格式（如 `2025-02-03T12:00:00`）     |

### 统一错误响应

接口在 4xx/5xx 时通常返回如下 JSON（具体字段以实际为准）：

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "具体错误说明",
  "timestamp": "2025-02-03T12:00:00"
}
```

- `status`: HTTP 状态码数字
- `error`: 简短错误类型
- `message`: 可读错误信息（部分接口可能无此字段）
- `timestamp`: 服务器时间

---

## 目录

1. [认证](#一认证)
2. [课程](#二课程)
3. [课程文件](#三课程文件)
4. [知识图谱](#四知识图谱)
5. [笔记](#五笔记)
6. [测验](#六测验)
7. [社区（帖子与评论）](#七社区帖子与评论)
8. [复习计划](#八复习计划)
9. [学习进度](#九学习进度)
10. [错题本](#十错题本)
11. [用户课程](#十一用户课程)
12. [用户与个人资料](#十二用户与个人资料)

---

## 一、认证

基于 JWT 的认证，支持角色：`USER`、`ADMIN`。登录/注册成功后返回 `token` 与当前用户信息，后续请求在 Header 中携带该 token。

### 1.1 用户注册

| 项目     | 说明                   |
|--------|----------------------|
| **方法** | `POST`               |
| **路径** | `/api/auth/register` |
| **认证** | 不需要                  |

**请求体**（JSON）

| 字段       | 类型     | 必填 | 说明                         |
|----------|--------|----|----------------------------|
| username | string | 是  | 用户名，非空                     |
| password | string | 是  | 密码，非空                      |
| role     | string | 否  | `USER` 或 `ADMIN`，默认 `USER` |

**成功响应** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "role": "USER"
  }
}
```

**错误响应**

- `400`: 用户名或密码为空
- `409`: 用户名已存在（具体 message 以接口为准）

---

### 1.2 用户登录

| 项目     | 说明                |
|--------|-------------------|
| **方法** | `POST`            |
| **路径** | `/api/auth/login` |
| **认证** | 不需要               |

**请求体**（JSON）

| 字段       | 类型     | 必填 | 说明  |
|----------|--------|----|-----|
| username | string | 是  | 用户名 |
| password | string | 是  | 密码  |

**成功响应** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "role": "USER"
  }
}
```

**错误响应**

- `400`: 用户名或密码为空
- `401`: 用户名或密码错误（message: "用户名或密码错误"）

---

## 二、课程

课程资源的 CRUD。需 JWT。`ADMIN` 或课程创建者（authorId）可管理课程，普通用户可读。

### 2.1 列出课程

| 项目     | 说明             |
|--------|----------------|
| **方法** | `GET`          |
| **路径** | `/api/courses` |
| **认证** | 需要             |

**查询参数**

| 参数    | 类型     | 必填 | 说明                                         |
|-------|--------|----|--------------------------------------------|
| q     | string | 否  | 按标题/描述关键词过滤                                |
| tags  | string | 否  | 逗号分隔标签，如 `数学,线代`                           |
| level | string | 否  | `BEGINNER` \| `INTERMEDIATE` \| `ADVANCED` |

**成功响应** `200 OK`

```json
[
  {
    "id": 1,
    "title": "线性代数入门",
    "description": "矩阵与向量基础",
    "tags": [
      "数学",
      "线代"
    ],
    "level": "BEGINNER",
    "authorId": 1,
    "syllabus": null,
    "createdAt": "2025-02-03T12:00:00"
  }
]
```

---

### 2.2 获取课程详情

| 项目     | 说明                  |
|--------|---------------------|
| **方法** | `GET`               |
| **路径** | `/api/courses/{id}` |
| **认证** | 需要                  |

**成功响应** `200 OK`  
返回单个课程对象（同上结构，含 syllabus 等）。

**错误响应** `404` Course not found

---

### 2.3 创建课程

| 项目     | 说明                |
|--------|-------------------|
| **方法** | `POST`            |
| **路径** | `/api/courses`    |
| **认证** | 需要（创建者即 authorId） |

**请求体**（JSON）

| 字段          | 类型       | 必填 | 说明                                   |
|-------------|----------|----|--------------------------------------|
| title       | string   | 是  | 课程标题                                 |
| description | string   | 否  | 课程描述                                 |
| tags        | string[] | 否  | 标签列表                                 |
| level       | string   | 否  | BEGINNER \| INTERMEDIATE \| ADVANCED |
| syllabus    | string   | 否  | 大纲（JSON 或文本）                         |

**成功响应** `201 Created`  
Body 为完整课程对象，`Location` 头为 `/api/courses/{id}`。

**错误响应** `400` 缺少 title 等

---

### 2.4 更新课程

| 项目     | 说明                  |
|--------|---------------------|
| **方法** | `PUT`               |
| **路径** | `/api/courses/{id}` |
| **认证** | 需要（ADMIN 或课程作者）     |

**请求体**：与创建相同，字段可部分提交。

**成功响应** `200 OK`  
返回更新后的课程对象。

**错误响应** `403` Not course owner or admin；`404` Course not found

---

### 2.5 删除课程

| 项目     | 说明                  |
|--------|---------------------|
| **方法** | `DELETE`            |
| **路径** | `/api/courses/{id}` |
| **认证** | 需要（ADMIN 或课程作者）     |

**成功响应** `204 No Content`

**错误响应** `403`、`404`

---

## 三、课程文件

课程下的文件上传、列表、下载、删除。需 JWT。

### 3.1 列出课程文件

| 项目     | 说明                              |
|--------|---------------------------------|
| **方法** | `GET`                           |
| **路径** | `/api/courses/{courseId}/files` |
| **认证** | 需要                              |

**成功响应** `200 OK`

```json
[
  {
    "id": 1,
    "filename": "lecture01.pdf",
    "contentType": "application/pdf",
    "uploadedBy": 1,
    "createdAt": "2025-02-03T12:00:00"
  }
]
```

---

### 3.2 上传文件

| 项目               | 说明                              |
|------------------|---------------------------------|
| **方法**           | `POST`                          |
| **路径**           | `/api/courses/{courseId}/files` |
| **认证**           | 需要                              |
| **Content-Type** | `multipart/form-data`           |

**请求体**：表单字段 `file`（文件）。

**成功响应** `201 Created`

```json
{
  "id": 1,
  "filename": "lecture01.pdf",
  "contentType": "application/pdf",
  "uploadedBy": 1,
  "createdAt": "2025-02-03T12:00:00"
}
```

---

### 3.3 下载文件

| 项目     | 说明                                       |
|--------|------------------------------------------|
| **方法** | `GET`                                    |
| **路径** | `/api/courses/{courseId}/files/{fileId}` |
| **认证** | 需要                                       |

**成功响应** `200 OK`  
Body 为文件二进制流，`Content-Type`、`Content-Disposition` 由服务端设置。

**错误响应** `404` 等

---

### 3.4 删除文件

| 项目     | 说明                                       |
|--------|------------------------------------------|
| **方法** | `DELETE`                                 |
| **路径** | `/api/courses/{courseId}/files/{fileId}` |
| **认证** | 需要（上传者或 ADMIN）                           |

**成功响应** `204 No Content`

---

## 四、知识图谱

按课程维护节点（Node）与关系（Relation）。需 JWT。写操作仅限 ADMIN 或课程作者。

**数据约定**

- **Node**：id（服务端生成）、label（必填）、type、description、meta
- **Relation**：id、from（节点 id）、to（节点 id）、type（必填）、directed（默认 true）、weight（0–1）、meta

### 4.1 列出节点

| 方法  | 路径                             | 说明        |
|-----|--------------------------------|-----------|
| GET | `/api/graphs/{courseId}/nodes` | 返回该课程全部节点 |

**成功响应** `200 OK`

```json
[
  {
    "id": "n1",
    "label": "矩阵",
    "type": "concept",
    "description": "定义简介",
    "meta": {}
  }
]
```

---

### 4.2 获取单个节点

| 方法  | 路径                                      | 说明         |
|-----|-----------------------------------------|------------|
| GET | `/api/graphs/{courseId}/nodes/{nodeId}` | 返回节点及入度/出度 |

**成功响应** `200 OK`

```json
{
  "node": {
    "id": "n1",
    "label": "矩阵",
    "type": "concept",
    "description": "定义简介",
    "meta": {}
  },
  "inDegree": 2,
  "outDegree": 1
}
```

**错误响应** `404` Node not found

---

### 4.3 创建节点

| 方法   | 路径                             | 说明          |
|------|--------------------------------|-------------|
| POST | `/api/graphs/{courseId}/nodes` | ADMIN 或课程作者 |

**请求体**：至少包含 `label`，可选 type、description、meta。

**成功响应** `201 Created`  
Body 为完整节点对象，含服务端生成的 id。

**错误响应** `400` label is required；`403`；`409` Node with same label exists

---

### 4.4 更新节点

| 方法  | 路径                                      | 说明          |
|-----|-----------------------------------------|-------------|
| PUT | `/api/graphs/{courseId}/nodes/{nodeId}` | ADMIN 或课程作者 |

**请求体**：可部分更新 label、type、description、meta。

**成功响应** `200 OK`  
**错误响应** `403`、`404`、`409`

---

### 4.5 删除节点

| 方法     | 路径                                      | 说明          |
|--------|-----------------------------------------|-------------|
| DELETE | `/api/graphs/{courseId}/nodes/{nodeId}` | ADMIN 或课程作者 |

**成功响应** `204 No Content`  
**错误响应** `403`、`404`、`409` Node is referenced by relations

---

### 4.6 列出关系

| 方法  | 路径                                 | 说明   |
|-----|------------------------------------|------|
| GET | `/api/graphs/{courseId}/relations` | 支持过滤 |

**查询参数**：`from`、`to`、`type`（均为可选）。

**成功响应** `200 OK`

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

---

### 4.7 创建关系

| 方法   | 路径                                 | 说明          |
|------|------------------------------------|-------------|
| POST | `/api/graphs/{courseId}/relations` | ADMIN 或课程作者 |

**请求体**：from、to、type 必填；directed、weight、meta 可选。

**成功响应** `201 Created`  
**错误响应** `400` from/to/type required；`404` Source or target node not found；`409` Relation already exists

---

### 4.8 更新关系

| 方法  | 路径                                              | 说明          |
|-----|-------------------------------------------------|-------------|
| PUT | `/api/graphs/{courseId}/relations/{relationId}` | ADMIN 或课程作者 |

**请求体**：可更新 type、directed、weight、meta。

**成功响应** `200 OK`  
**错误响应** `404` Relation not found

---

### 4.9 删除关系

| 方法     | 路径                                              | 说明          |
|--------|-------------------------------------------------|-------------|
| DELETE | `/api/graphs/{courseId}/relations/{relationId}` | ADMIN 或课程作者 |

**成功响应** `204 No Content`  
**错误响应** `404`

---

## 五、笔记

课程下的笔记，支持公开/私有。需 JWT。仅笔记作者或 ADMIN 可修改/删除。

**Note 字段**：id、courseId、title、content、summary、authorId、visibility（public/private）、createdAt、updatedAt。

### 5.1 列出笔记

| 方法  | 路径                              | 说明                    |
|-----|---------------------------------|-----------------------|
| GET | `/api/courses/{courseId}/notes` | 当前用户可见的笔记（公开 + 自己的私有） |

**成功响应** `200 OK`  
数组，元素为 Note 对象（含 summary 等）。

---

### 5.2 获取单条笔记

| 方法  | 路径                                       | 说明   |
|-----|------------------------------------------|------|
| GET | `/api/courses/{courseId}/notes/{noteId}` | 笔记详情 |

**成功响应** `200 OK`  
**错误响应** `404` Note not found

---

### 5.3 创建笔记

| 方法   | 路径                              | 说明                     |
|------|---------------------------------|------------------------|
| POST | `/api/courses/{courseId}/notes` | 任意已认证用户，authorId 为当前用户 |

**请求体**：title、content 必填；summary、visibility 可选。

**成功响应** `201 Created`  
**错误响应** `400` title and content are required

---

### 5.4 更新笔记

| 方法  | 路径                                       | 说明          |
|-----|------------------------------------------|-------------|
| PUT | `/api/courses/{courseId}/notes/{noteId}` | 笔记作者或 ADMIN |

**请求体**：可部分更新。

**成功响应** `200 OK`  
**错误响应** `403`、`404`

---

### 5.5 删除笔记

| 方法     | 路径                                       | 说明          |
|--------|------------------------------------------|-------------|
| DELETE | `/api/courses/{courseId}/notes/{noteId}` | 笔记作者或 ADMIN |

**成功响应** `204 No Content`  
**错误响应** `404`

---

## 六、测验

课程下的测验与题目。需 JWT。创建/更新/删除仅限 ADMIN 或课程作者；普通用户可读测验并提交答卷。题目类型：`single`、`multiple`、
`truefalse`。普通用户接口返回的题目中不包含正确答案（answer）。

### 6.1 列出测验

| 方法  | 路径                                | 说明                      |
|-----|-----------------------------------|-------------------------|
| GET | `/api/courses/{courseId}/quizzes` | 该课程下所有测验，普通用户题目无 answer |

**成功响应** `200 OK`  
数组，元素含 id、courseId、title、questions（无 answer）、authorId、createdAt 等。

---

### 6.2 获取测验详情

| 方法  | 路径                                         | 说明                 |
|-----|--------------------------------------------|--------------------|
| GET | `/api/courses/{courseId}/quizzes/{quizId}` | 作者/ADMIN 可见 answer |

**成功响应** `200 OK`  
**错误响应** `404` Quiz not found

---

### 6.3 创建测验

| 方法   | 路径                                | 说明          |
|------|-----------------------------------|-------------|
| POST | `/api/courses/{courseId}/quizzes` | ADMIN 或课程作者 |

**请求体**（JSON）

- title：必填
- questions：数组，每项含 type、question；选择题含 options、answer（选项索引数组，0-based）

**成功响应** `201 Created`  
**错误响应** `400` title and questions are required；`403`

---

### 6.4 更新测验

| 方法  | 路径                                         | 说明          |
|-----|--------------------------------------------|-------------|
| PUT | `/api/courses/{courseId}/quizzes/{quizId}` | ADMIN 或课程作者 |

**请求体**：可部分更新 title、questions。

**成功响应** `200 OK`  
**错误响应** `403`、`404`

---

### 6.5 删除测验

| 方法     | 路径                                         | 说明          |
|--------|--------------------------------------------|-------------|
| DELETE | `/api/courses/{courseId}/quizzes/{quizId}` | ADMIN 或课程作者 |

**成功响应** `204 No Content`  
**错误响应** `403`、`404`

---

### 6.6 提交答卷

| 方法   | 路径                                                  | 说明              |
|------|-----------------------------------------------------|-----------------|
| POST | `/api/courses/{courseId}/quizzes/{quizId}/attempts` | 已认证用户，自动计分并记录进度 |

**请求体**（JSON）

```json
{
  "answers": [
    {
      "questionId": "q1-1",
      "answer": [
        1
      ]
    }
  ]
}
```

- questionId：题目 id（如 q1-1）
- answer：选项索引数组（单选单元素，多选多元素）

**成功响应** `200 OK`

```json
{
  "quizId": "q1",
  "userId": 1,
  "score": 80,
  "total": 100,
  "results": [
    {
      "questionId": "q1-1",
      "questionEntityId": 101,
      "correct": true,
      "score": 50
    }
  ],
  "submittedAt": "2025-02-03T12:00:00"
}
```

- results 中每项可能含 `questionEntityId`（题目实体 id，用于错题本等）。  
  **错误响应** `400` answers format invalid；`404` Quiz not found

---

## 七、社区（帖子与评论）

课程下的帖子（Post）与评论（Comment）。需 JWT。仅作者或 ADMIN 可修改/删除自己的帖子/评论。

### 7.1 帖子

**Post**：id、courseId、authorId、title、content、createdAt、updatedAt、authorUsername（可选）。

| 方法     | 路径                                       | 说明                       |
|--------|------------------------------------------|--------------------------|
| GET    | `/api/courses/{courseId}/posts`          | 该课程帖子列表                  |
| GET    | `/api/courses/{courseId}/posts/{postId}` | 帖子详情（帖子不属于该课程时 400）      |
| POST   | `/api/courses/{courseId}/posts`          | 创建帖子，body: title、content |
| PUT    | `/api/courses/{courseId}/posts/{postId}` | 更新帖子（作者或 ADMIN）          |
| DELETE | `/api/courses/{courseId}/posts/{postId}` | 删除帖子（作者或 ADMIN）          |

创建成功 `201 Created`，返回完整 Post；更新 `200 OK`；删除 `204 No Content`。

---

### 7.2 评论

**Comment**：id、postId、authorId、content、parentId（可选，用于回复）、createdAt、updatedAt、authorUsername（可选）。

| 方法     | 路径                                                            | 说明                              |
|--------|---------------------------------------------------------------|---------------------------------|
| GET    | `/api/courses/{courseId}/posts/{postId}/comments`             | 该帖子下评论列表                        |
| GET    | `/api/courses/{courseId}/posts/{postId}/comments/{commentId}` | 单条评论（不属于该帖子时 400）               |
| POST   | `/api/courses/{courseId}/posts/{postId}/comments`             | 创建评论，body: content、parentId（可选） |
| PUT    | `/api/courses/{courseId}/posts/{postId}/comments/{commentId}` | 更新评论（作者或 ADMIN）                 |
| DELETE | `/api/courses/{courseId}/posts/{postId}/comments/{commentId}` | 删除评论（作者或 ADMIN）                 |

创建成功 `201 Created`，其余同上。

---

## 八、复习计划

用户个人的复习计划与考试安排。需 JWT。用户仅能管理自己的计划。

**ReviewPlan**：id、userId、planDate（YYYY-MM-DD）、title、description、type（plan \| exam）、completed、createdAt、updatedAt。

### 8.1 列出所有计划

| 方法  | 路径                  | 说明       |
|-----|---------------------|----------|
| GET | `/api/review-plans` | 当前用户全部计划 |

**成功响应** `200 OK`  
数组，按需排序。

---

### 8.2 按日期范围查询

| 方法  | 路径                             | 说明                                        |
|-----|--------------------------------|-------------------------------------------|
| GET | `/api/review-plans/date-range` | 查询参数：startDate、endDate（ISO 日期 YYYY-MM-DD） |

**成功响应** `200 OK`  
计划数组。

---

### 8.3 按单日查询

| 方法  | 路径                              | 说明                |
|-----|---------------------------------|-------------------|
| GET | `/api/review-plans/date/{date}` | date 为 YYYY-MM-DD |

**成功响应** `200 OK`  
计划数组。

---

### 8.4 获取单条计划

| 方法  | 路径                       | 说明  |
|-----|--------------------------|-----|
| GET | `/api/review-plans/{id}` | 仅本人 |

**成功响应** `200 OK`  
**错误响应** `404` 等

---

### 8.5 创建计划

| 方法   | 路径                  | 说明                                                      |
|------|---------------------|---------------------------------------------------------|
| POST | `/api/review-plans` | body: planDate、title、description（可选）、type、completed（可选） |

**成功响应** `201 Created`  
**错误响应** `400` 缺少必填字段或 type 非法

---

### 8.6 更新计划

| 方法  | 路径                       | 说明             |
|-----|--------------------------|----------------|
| PUT | `/api/review-plans/{id}` | 仅本人，body 可部分更新 |

**成功响应** `200 OK`  
**错误响应** `404`

---

### 8.7 删除计划

| 方法     | 路径                       | 说明  |
|--------|--------------------------|-----|
| DELETE | `/api/review-plans/{id}` | 仅本人 |

**成功响应** `204 No Content`  
**错误响应** `404`

---

## 九、学习进度

用户测验完成情况与统计。需 JWT。统计范围：若用户设置了「当前学习课程」，则仅统计该课程；否则统计用户已选课程。

### 9.1 总体统计

| 方法  | 路径                      | 说明       |
|-----|-------------------------|----------|
| GET | `/api/progress/overall` | 当前用户总体统计 |

**成功响应** `200 OK`

```json
{
  "totalCourses": 3,
  "totalQuizzes": 15,
  "completedQuizzes": 6,
  "averageScore": 85,
  "totalNotes": 10,
  "completionRate": 40
}
```

- totalCourses：统计涉及的课程数
- totalQuizzes：这些课程下测验总数
- completedQuizzes：已完成测验数
- averageScore：已完成测验平均分（整数）
- totalNotes：笔记总数
- completionRate：完成率百分比（0–100）

---

### 9.2 所有课程进度列表

| 方法  | 路径                      | 说明            |
|-----|-------------------------|---------------|
| GET | `/api/progress/courses` | 当前用户在各课程的进度摘要 |

**成功响应** `200 OK`

```json
[
  {
    "courseId": 1,
    "totalQuizzes": 5,
    "completedQuizzes": 2,
    "averageScore": 88,
    "noteCount": 3,
    "completionRate": 40,
    "quizProgressList": [
      {
        "quizId": "q1",
        "score": 90,
        "totalScore": 100,
        "completedAt": "2025-02-03T12:00:00"
      }
    ]
  }
]
```

---

### 9.3 单门课程进度详情

| 方法  | 路径                                 | 说明            |
|-----|------------------------------------|---------------|
| GET | `/api/progress/courses/{courseId}` | 当前用户在该课程的详细进度 |

**成功响应** `200 OK`  
单个对象，结构同上（courseId、totalQuizzes、completedQuizzes、averageScore、noteCount、completionRate、quizProgressList）。

**错误响应** `404` Course not found

---

## 十、错题本

按课程收集错题、标记掌握、练习统计。需 JWT。用户仅能操作自己的错题。

### 10.1 列出错题

| 方法  | 路径                                        | 说明                        |
|-----|-------------------------------------------|---------------------------|
| GET | `/api/courses/{courseId}/wrong-questions` | 查询参数：mastered（可选，boolean） |

**成功响应** `200 OK`  
WrongQuestion 数组（含 id、userId、courseId、questionId、quizId、userAnswer、mastered、addedAt、lastPracticedAt、practiceCount 等）。

---

### 10.2 添加错题

| 方法   | 路径                                        | 说明                                           |
|------|-------------------------------------------|----------------------------------------------|
| POST | `/api/courses/{courseId}/wrong-questions` | body: questionId（题目实体 id）、userAnswer（选项索引数组） |

**成功响应** `200 OK`  
返回完整 WrongQuestion 对象。

---

### 10.3 标记已掌握

| 方法  | 路径                                                                   | 说明        |
|-----|----------------------------------------------------------------------|-----------|
| PUT | `/api/courses/{courseId}/wrong-questions/{wrongQuestionId}/mastered` | 将错题标记为已掌握 |

**成功响应** `200 OK`  
返回更新后的 WrongQuestion。

---

### 10.4 删除错题

| 方法     | 路径                                                          | 说明     |
|--------|-------------------------------------------------------------|--------|
| DELETE | `/api/courses/{courseId}/wrong-questions/{wrongQuestionId}` | 从错题本移除 |

**成功响应** `204 No Content`

---

### 10.5 练习错题（增加练习次数）

| 方法   | 路径                                                                   | 说明     |
|------|----------------------------------------------------------------------|--------|
| POST | `/api/courses/{courseId}/wrong-questions/{wrongQuestionId}/practice` | 记录一次练习 |

**成功响应** `200 OK`  
返回更新后的 WrongQuestion（含 practiceCount、lastPracticedAt）。

---

### 10.6 错题统计

| 方法  | 路径                                              | 说明      |
|-----|-------------------------------------------------|---------|
| GET | `/api/courses/{courseId}/wrong-questions/stats` | 该课程错题统计 |

**成功响应** `200 OK`

```json
{
  "total": 10,
  "mastered": 3,
  "notMastered": 7
}
```

---

## 十一、用户课程

用户「已选课程」与「当前学习课程」。需 JWT。用户仅能管理自己的选择。

### 11.1 获取已选课程列表

| 方法  | 路径                  | 说明              |
|-----|---------------------|-----------------|
| GET | `/api/user-courses` | 当前用户已选课程及当前学习标记 |

**成功响应** `200 OK`

```json
[
  {
    "courseId": 1,
    "courseTitle": "Java 编程基础",
    "isCurrentStudying": true,
    "addedAt": "2025-02-03T12:00:00",
    "studyingStartedAt": "2025-02-03T12:00:00"
  }
]
```

---

### 11.2 添加课程

| 方法   | 路径                             | 说明                   |
|------|--------------------------------|----------------------|
| POST | `/api/user-courses/{courseId}` | 将课程加入学习列表，已存在则返回 200 |

**成功响应** `200 OK`  
**错误响应** `404` Course not found

---

### 11.3 移除课程

| 方法     | 路径                             | 说明      |
|--------|--------------------------------|---------|
| DELETE | `/api/user-courses/{courseId}` | 从学习列表移除 |

**成功响应** `204 No Content`  
**错误响应** `404` Course not in user's list

---

### 11.4 设置当前学习课程

| 方法  | 路径                                              | 说明                |
|-----|-------------------------------------------------|-------------------|
| PUT | `/api/user-courses/{courseId}/current-studying` | 将该课程设为当前学习（仅能有一个） |

**成功响应** `200 OK`  
**错误响应** `404` Course not in user's list

---

### 11.5 取消当前学习课程

| 方法     | 路径                                   | 说明       |
|--------|--------------------------------------|----------|
| DELETE | `/api/user-courses/current-studying` | 清除当前学习标记 |

**成功响应** `204 No Content`

---

### 11.6 获取当前学习课程 ID

| 方法  | 路径                                   | 说明                    |
|-----|--------------------------------------|-----------------------|
| GET | `/api/user-courses/current-studying` | 返回当前学习的课程 ID，无则为 null |

**成功响应** `200 OK`

```json
{
  "courseId": 1
}
```

无当前学习时：`{ "courseId": null }`。

---

## 十二、用户与个人资料

当前用户资料与头像。需 JWT。

### 12.1 获取当前用户资料

| 方法  | 路径              | 说明           |
|-----|-----------------|--------------|
| GET | `/api/users/me` | 当前用户资料（不含密码） |

**成功响应** `200 OK`

```json
{
  "id": 1,
  "username": "testuser",
  "role": "USER",
  "nickname": "昵称",
  "bio": "个人简介",
  "hasAvatar": true
}
```

---

### 12.2 更新当前用户资料

| 方法  | 路径              | 说明                               |
|-----|-----------------|----------------------------------|
| PUT | `/api/users/me` | body: nickname、bio（均为可选，只更新传入字段） |

**成功响应** `200 OK`  
返回同 12.1 结构的对象。

---

### 12.3 获取头像

| 方法  | 路径                     | 说明                          |
|-----|------------------------|-----------------------------|
| GET | `/api/users/me/avatar` | 返回图片二进制流，Content-Type 为图片类型 |

**成功响应** `200 OK`  
**无头像** `204 No Content`

---

### 12.4 上传头像

| 方法   | 路径                     | 说明                                          |
|------|------------------------|---------------------------------------------|
| POST | `/api/users/me/avatar` | Content-Type: multipart/form-data，表单字段 file |

**成功响应** `200 OK`

```json
{
  "message": "头像上传成功"
}
```

---

*文档版本与后端实现保持一致，如有差异以实际接口为准。*

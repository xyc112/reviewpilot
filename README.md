# ReviewPilot

> 基于知识图谱的个性化复习导航系统 | 南京大学《人机交互》课程项目

![Java](https://img.shields.io/badge/Java-25-blue.svg) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg) ![MySQL](https://img.shields.io/badge/MySQL-8.4.3-orange.svg) ![Vue](https://img.shields.io/badge/Vue-3-4FC08D.svg)  ![Electron](https://img.shields.io/badge/Electron-28-47848F.svg)

## 🎯 项目简介

ReviewPilot 是一个面向高校学生的智能复习导航平台，通过将静态知识图谱与动态个人学习数据相结合，为学生提供端到端的个性化复习工作流管理。

**项目背景**：南京大学软件工程专业大三《人机交互》课程作业

## ✨ 核心特色

| 特性                 | 描述                                           |
| :------------------- | :--------------------------------------------- |
| 🎯 **智能诊断**       | 基于用户真实学习历史进行数据驱动的个性化分析   |
| 🎨 **可视化图谱**     | 交互式知识图谱作为学习工作区，直观展示知识关系 |
| 🔄 **学习闭环**       | 诊断 → 学习 → 练习 → 评估的完整学习流程        |
| 📊 **实时反馈**       | 即时测验评分和学习进度追踪                     |
| 🗂️ **个性化笔记**     | 支持富文本的知识点笔记管理                     |
| 💻 **跨平台桌面应用** | 基于 Electron 的桌面客户端，更好的用户体验     |

## 🏗️ 系统架构

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Desktop Client    │    │  Business Logic     │    │   Cloud Database    │
│                     │    │       Layer         │    │                     │
│    • Electron       │    │    • Spring Boot    │    │      • SQLPub       │
│    • Vue 3          │    │    • JPA/Hibernate  │    │    • MySQL 8.4      │
│    • TypeScript     │    │    • REST API       │    │   • Cloud Hosted    │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🛠️ 技术栈

### 后端技术

- **框架**: Spring Boot 3.5.6
- **数据库**: MySQL 8.4.3 (SQLPub 云数据库)
- **ORM**: Spring Data JPA + Hibernate
- **构建工具**: Maven
- **Java版本**: 25
- **API文档**: Springdoc OpenAPI

### 前端技术

- **框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **UI组件**: Element Plus
- **可视化**: ECharts / D3.js

### 桌面客户端

- **框架**: Electron 28
- **启动方式**: 直接加载 Vite 开发服务器 (`http://localhost:5173`)
- **窗口特性**: 最大化启动、无菜单栏、纯净套壳
- **跨平台**: Windows、macOS、Linux

## 🚀 快速开始

### 环境要求

- **Java**: 25
- **Maven**: 3.6+
- **Node.js**: 16+

### 数据库配置

项目使用 **SQLPub 云数据库**，无需本地安装 MySQL：

1. **环境变量配置**

   设置数据库连接密码环境变量：

   **Windows PowerShell:**

   ```powershell
   # 需要管理员权限 - 以管理员身份运行 PowerShell
   [System.Environment]::SetEnvironmentVariable("REVIEWPILOT_DB_PASSWORD", "数据库密码", "Machine")
   ```

   **Linux/Mac:**

   ```bash
   echo 'export REVIEWPILOT_DB_PASSWORD="数据库密码"' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **验证环境变量**

   ```bash
   echo $REVIEWPILOT_DB_PASSWORD  # Linux/Mac
   echo $env:REVIEWPILOT_DB_PASSWORD  # Windows PowerShell
   ```

### 后端部署

1. **克隆项目**

```bash
git clone https://github.com/nju-softeng/reviewpilot.git
cd reviewpilot/backend
```

2. **应用配置**

   项目已配置云数据库连接，无需修改 `application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql2.sqlpub.com:3307/reviewpilot?useSSL=false&serverTimezone=Asia/Shanghai
    username: reviewpilot
    password: ${REVIEWPILOT_DB_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver
```

3. **启动应用**

```bash
mvn clean install
mvn spring-boot:run
```

### 前端部署

#### 方式一：Web 版本

```bash
cd ../frontend
npm install
vite
```

#### 方式二：桌面客户端

```bash
cd ../electron
npm install
npm start
```

### 完整启动流程

```bash
# 终端1：启动后端
cd backend
mvn spring-boot:run

# 终端2：启动前端开发服务器
cd ../frontend
vite

# 终端3：启动桌面应用（依赖前端服务）
cd ../electron
npm start
```

### 验证启动

访问以下地址验证系统运行状态：

- 后端API: `http://localhost:8080/api/courses`
- 前端应用: `http://localhost:5173` 
- 桌面应用: 直接运行 Electron 客户端

## 📦 桌面应用特性

### Electron 层特点

- ✅ **纯净套壳**: 无额外菜单栏，专注内容展示
- ✅ **最大化启动**: 窗口自动最大化，最佳视觉体验
- ✅ **开发友好**: 直接代理到 Vite 开发服务器
- ✅ **完全解耦**: 不影响原有 Web 项目架构

### 开发环境运行

```bash
cd electron
npm start
```

### 生产环境打包

```bash
# 打包为当前平台应用
npm run build
```

## 🔧 配置说明

### 数据库连接池配置

项目已优化数据库连接池，适合多人协作开发：

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 7      # 每人最大7个连接
      minimum-idle: 3           # 保持3个空闲连接
      idle-timeout: 600000      # 10分钟空闲超时
      max-lifetime: 1800000     # 30分钟连接生命周期
```

### Electron 配置

```javascript
// main.js 核心配置
const mainWindow = new BrowserWindow({
  show: false,           // 先隐藏窗口
  autoHideMenuBar: false, // 无菜单栏
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true
  }
});

// 最大化并显示
mainWindow.maximize();
mainWindow.show();
```

### 云数据库优势

- ✅ **无需本地安装**：省去 MySQL 安装配置步骤
- ✅ **数据持久化**：数据安全存储在云端
- ✅ **团队协作**：四人小组共享同一数据库
- ✅ **自动备份**：云服务提供数据备份
- ✅ **性能稳定**：专业数据库托管服务

## 📚 功能模块

### 1. 知识图谱管理 📊

- **课程管理**: 创建、查看、管理课程信息
- **知识点建模**: 定义知识点及其属性
- **关系管理**: 建立知识点间的关联关系（前置、包含、相关）
- **可视化展示**: 动态生成交互式知识图谱

### 2. 学习诊断系统 🎯

- **成绩导入**: 支持批量导入历史成绩数据
- **能力评估**: 基于成绩数据计算知识点掌握程度
- **薄弱点识别**: 智能识别需要重点复习的知识点
- **进度追踪**: 可视化学习进度和提升轨迹

### 3. 个性化学习工具 📝

- **智能笔记**: 基于知识点的个性化笔记管理
- **富文本编辑**: 支持Markdown和富文本格式
- **附件管理**: 上传和管理学习资料
- **笔记关联**: 笔记与知识点智能关联

### 4. 自测评估系统 ✅

- **随机组卷**: 根据知识点智能生成测验题目
- **实时评分**: 即时反馈测验结果和答案解析
- **历史记录**: 追踪历次测验表现和进步情况
- **错题本**: 自动收集和管理错题

## 🔗 API 接口

### 基础信息

- **基础URL**: `http://localhost:8080/api`
- **数据格式**: JSON
- **认证方式**: 开发阶段使用默认用户ID=1
- **API文档**: [详细API文档](./docs/api.md)

### 核心接口示例

#### 课程管理

```http
GET /api/courses
POST /api/courses
GET /api/courses/{courseId}
```

#### 知识图谱

```http
GET /api/courses/{courseId}/knowledge-graph?userId=1
POST /api/courses/{courseId}/knowledge-points
POST /api/knowledge-relations
```

#### 学习数据

```http
POST /api/user/scores/batch
GET /api/user/scores?courseId=1&userId=1
GET /api/user/weak-points?courseId=1&userId=1
```

#### 笔记管理

```http
GET /api/user/knowledge-points/{pointId}/user-note?userId=1
PUT /api/user/knowledge-points/{pointId}/user-note?userId=1
```

#### 测验系统

```http
GET /api/quiz/questions/random?pointId=1&count=5
POST /api/quiz/attempt
GET /api/quiz/attempts/history?pointId=1
```

## 📁 项目结构

```
reviewpilot/
├── backend/                         # 后端项目
│   ├── src/main/java/
│   │   └── com/nju/reviewpilot/
│   │       ├── entity/              # 数据实体类
│   │       ├── repository/          # 数据访问层
│   │       ├── service/             # 业务逻辑层
│   │       ├── controller/          # API控制层
│   │       ├── dto/                 # 数据传输对象
│   │       ├── config/              # 配置类
│   │       └── handler/             # 异常处理
│   ├── src/main/resources/
│   │   └── application.yml          # 应用配置（已配置云数据库）
│   └── pom.xml                      # Maven配置
├── frontend/                        # 前端项目
│   ├── src/
│   │   ├── components/              # Vue组件
│   │   ├── views/                   # 页面视图
│   │   ├── stores/                  # Pinia状态管理
│   │   ├── router/                  # 路由配置
│   │   └── utils/                   # 工具函数
│   └── package.json
├── electron/                        # 桌面客户端
│   ├── main.js                      # Electron 主进程
│   ├── package.json                 # 依赖配置
│   ├── package-lock.json            # 依赖锁文件
│   └── node_modules/                # 依赖包
├── docs/                            # 项目文档
│   ├── api.md                       # API接口文档
│   └── design.md                    # 系统设计文档
│
└── README.md                        # 项目说明文档
```

## 👥 开发团队

- 专注于人机交互技术与学习系统的深度结合
- 采用敏捷开发方法，快速迭代完善
- 注重代码质量、用户体验和系统性能

------
**让复习更高效，让学习更智能** ✨
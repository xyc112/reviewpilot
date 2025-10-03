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

## 🛠️ 技术栈

### 后端技术栈
- **框架**: Spring Boot 3.5.6
- **数据库**: MySQL 8.4.3 (SQLPub 云数据库)
- **ORM**: Spring Data JPA + Hibernate
- **构建工具**: Maven
- **Java版本**: 25
- **API文档**: Springdoc OpenAPI 3.0
- **认证授权**: JWT Token

### 前端技术栈
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **UI组件**: Element Plus
- **可视化**: ECharts 5
- **图标**: Element Plus Icons

### 桌面客户端
- **框架**: Electron 28
- **启动方式**: 加载 Vite 开发服务器 (`http://localhost:5173`)
- **窗口特性**: 最大化启动、无菜单栏、专注模式
- **跨平台支持**: Windows、macOS、Linux

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

2. **验证环境变量**

   ```powershell
   echo $env:REVIEWPILOT_DB_PASSWORD
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

后端服务将在 `http://localhost:8080` 启动

### 前端部署

#### Web 版本开发

```bash
cd ../frontend
npm install
npm run dev
```

访问 `http://localhost:5173`

#### 桌面客户端

```bash
cd ../electron
npm install
npm start
```

## 📦 应用特性

### Electron 客户端优势

- ✅ **原生应用体验**: 独立的桌面应用，更好的性能
- ✅ **专注学习模式**: 无干扰界面设计，提升学习效率
- ✅ **开发友好**: 热重载开发，快速迭代
- ✅ **跨平台兼容**: 支持主流操作系统

### 云数据库优势

- ✅ **零配置部署**: 无需本地数据库安装配置
- ✅ **数据安全**: 云端自动备份，数据永不丢失
- ✅ **团队协作**: 支持多人同时开发测试
- ✅ **性能稳定**: 专业数据库托管服务

## 🔧 核心配置

### 数据库连接池优化

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10      # 最大连接数
      minimum-idle: 3           # 最小空闲连接
      idle-timeout: 600000      # 空闲连接超时(10分钟)
      max-lifetime: 1800000     # 连接最大生命周期(30分钟)
      connection-timeout: 30000 # 连接超时时间
```

### API 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000+00:00"
}
```

## 📚 功能模块详解

### 1. 知识图谱管理 📊

- **课程体系管理**: 创建、编辑课程信息，建立课程知识结构
- **知识点建模**: 定义知识点属性、难度等级、预估学习时间
- **关系网络构建**: 建立知识点间的关联关系（前置依赖、包含、相关）
- **可视化展示**: 动态生成交互式知识图谱，直观展示学习路径

### 2. 学习诊断系统 🎯

- **多源数据导入**: 支持成绩数据批量导入和实时同步
- **能力精准评估**: 基于历史表现计算知识点掌握程度
- **薄弱环节识别**: 智能分析学习短板，生成针对性复习建议
- **进度可视化**: 学习轨迹追踪，进步趋势分析

### 3. 个性化学习工具 📝

- **智能笔记系统**: 知识点关联笔记，支持富文本和Markdown
- **附件资源管理**: 学习资料上传、分类、快速检索
- **学习计划制定**: 基于诊断结果生成个性化学习路径
- **进度提醒**: 学习任务提醒和完成情况跟踪

### 4. 自测评估系统 ✅

- **智能组卷**: 基于知识点和难度自动生成测验题目
- **实时评估**: 即时评分、答案解析和知识点关联
- **历史追踪**: 测验记录存储，进步曲线展示
- **错题本功能**: 自动收集错题，支持针对性练习

## 🔗 API 接口

### 基础信息

- **基础URL**: `http://localhost:8080/api`
- **数据格式**: JSON
- **认证方式**: JWT Token (Authorization Header)
- **详细文档**: [API接口文档](./docs/api.md)

## 📁 项目结构

```
reviewpilot/
├── backend/                         # 后端项目
│   ├── src/main/java/
│   │   └── com/reviewpilot/
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
│   │   ├── components/             # 可复用Vue组件
│   │   ├── views/                  # 页面级组件
│   │   ├── stores/                 # Pinia状态管理
│   │   ├── router/                 # 路由配置
│   │   ├── types/                  # TypeScript类型定义
│   │   └── assets/                 # 静态资源
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

**南京大学软件学院《人机交互》课程项目组**

### 开发理念

- 🎯 **用户为中心**: 深度理解学习场景，优化用户体验
- 🔧 **技术驱动**: 采用现代技术栈，确保系统性能和可维护性
- 📈 **数据智能**: 基于学习数据分析，提供个性化学习建议
- 🚀 **持续迭代**: 敏捷开发，快速响应需求变化

### 质量保证

- ✅ **代码规范**: 统一的代码风格和最佳实践
- ✅ **自动化测试**: 单元测试、集成测试覆盖核心功能
- ✅ **文档完善**: 详细的开发文档和使用指南
- ✅ **性能优化**: 数据库优化、前端懒加载、缓存策略

------

**让复习更高效，让学习更智能** ✨

*ReviewPilot - 你的个性化学习导航伙伴*
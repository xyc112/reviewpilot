# ReviewPilot

> 基于知识图谱的个性化复习导航系统 | 南京大学《人机交互》课程项目

![Java](https://img.shields.io/badge/Java-21-007396?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?style=flat&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)

## 🎯 项目简介

ReviewPilot 是一个面向高校学生的智能复习导航平台，通过将静态知识图谱与动态个人学习数据相结合，为学生提供端到端的个性化复习工作流管理。

## ✨ 核心特色

| 特性            | 描述                       |
|:--------------|:-------------------------|
| 🎯 **智能诊断**   | 基于用户真实学习历史进行数据驱动的个性化分析   |
| 🎨 **可视化图谱**  | 交互式知识图谱作为学习工作区，直观展示知识关系  |
| 🔄 **学习闭环**   | 诊断 → 学习 → 练习 → 评估的完整学习流程 |
| 📊 **实时反馈**   | 即时测验评分和学习进度追踪            |
| 🗂️ **个性化笔记** | 支持富文本的知识点笔记管理            |

## 🛠️ 技术栈

### 后端技术栈
- **框架**: Spring Boot 3.5.6
- **数据库**: MySQL 8.4.3 (SQLPub 云数据库)
- **ORM**: Spring Data JPA + Hibernate
- **构建工具**: Maven
- **Java版本**: 21
- **认证授权**: JWT Token

### 前端技术栈
- **框架**: React 18 + TypeScript 5.9
- **构建工具**: Vite 7.1
- **状态管理**: Zustand 5.0
- **路由**: React Router DOM 6.20
- **HTTP客户端**: Axios 1.12
- **UI组件**: Ant Design 5.27
- **样式方案**: Emotion (CSS-in-JS)
- **可视化**: ECharts 5 + echarts-for-react
- **图标**: Ant Design Icons

## 🚀 快速开始

### 环境要求
- Java 21, Node.js 24, Maven 3.9

### 数据库配置

```bash
setx REVIEWPILOT_DB_PASSWORD "数据库密码" /M
```


### 启动应用

1. **克隆项目**

	```bash
	git clone https://github.com/xyc112/reviewpilot.git
	cd reviewpilot
	```
	
2. **启动后端**

	```bash
	cd backend && mvn spring-boot:run 
	```
	
3. **启动前端**
	
	```bash
	cd ../frontend && npm i && vite
	```

## 🏗️ 系统架构

### 整体架构

```text
前端展现层 (React + TypeScript)
    ↓
API网关层 (路由/认证/限流)
    ↓
业务逻辑层 (用户/课程/图谱/诊断/测验/笔记服务)
    ↓
数据持久层 (MySQL + 文件存储 + 缓存)
```

### 核心模块

1. **知识图谱管理** - 课程体系、知识点建模、关系网络
2. **学习诊断系统** - 数据收集、能力评估、薄弱识别
3. **个性化学习工具** - 智能笔记、学习计划、进度跟踪
4. **自测评估系统** - 智能组卷、实时评分、错题本

## 🔗 API 接口

### 基础信息

- **基础URL**: `http://localhost:8080/api`
- **数据格式**: JSON
- **认证方式**: JWT Token (Authorization Header)
- **详细文档**: [API接口文档](./API.md)

## 📁 项目结构

```text
reviewpilot/
├── 📄 README.md # 项目说明文档
├── 📄 API.md # API接口文档
├── 📁 backend/ # 后端项目
│         ├── src/main/
│         │        ├── java/backend/
│         │        │         ├── entity/ # 数据实体类
│         │        │         ├── repository/ # 数据访问层
│         │        │         ├── service/ # 业务逻辑层
│         │        │         ├── controller/ # API控制层
│         │        │         └── handler/ # 异常处理
│         │        └── resources/
│         │              └── application.yml # 应用配置
│         └── pom.xml # Maven配置
└── 📁 frontend/ # 前端项目
          ├── src/
          │    ├── components/ # 可复用组件
          │    │     ├── EmptyState.tsx # 空状态组件
          │    │     ├── ErrorBoundary.tsx # 错误边界组件
          │    │     ├── LoadingSpinner.tsx # 加载动画组件
          │    │     ├── AppHeader.tsx # 顶部导航
          │    │     └── AppSider.tsx # 侧边栏
          │    ├── pages/ # 页面组件
          │    │    ├── Dashboard.tsx # 仪表板页面
          │    │    ├── KnowledgeGraph.tsx # 知识图谱页面
          │    │    ├── LearningDiagnosis.tsx # 学习诊断页面
          │    │    ├── QuizSystem.tsx # 测验系统页面
          │    │    ├── NotesManagement.tsx # 笔记管理页面
          │    │    └── Analytics.tsx # 统计分析页面
          │    ├── stores/ # 状态管理
          │    │    ├── appStore.ts # 应用状态
          │    │    └── authStore.ts # 认证状态
          │    ├── services/ # API 服务
          │    │    └── api.ts # API客户端
          │    ├── types/ # TypeScript 类型定义
          │    │    └── api.ts # API类型定义
          │    ├── utils/ # 工具函数
          │    │    ├── constants.ts # 常量定义
          │    │    └── helpers.ts # 辅助函数
          │    ├── App.tsx # 根组件
          │    └── main.tsx # 应用入口
          ├── index.html # HTML入口文件
          ├── package.json # 项目依赖
          ├── package-lock.json # 依赖锁文件
          ├── tsconfig.json # TypeScript配置
          └── vite.config.ts # Vite构建配置
```
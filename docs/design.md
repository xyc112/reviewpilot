## ReviewPilot - 基于知识图谱的个性化复习导航系统

### 项目概述

**ReviewPilot** 是一个面向高校学生的智能复习导航平台，通过将静态知识图谱与动态个人学习数据相结合，为学生提供端到端的个性化复习工作流管理。

### 核心价值主张

与传统学习平台相比，ReviewPilot的核心差异化在于：

1. **数据驱动个性化** - 基于用户真实学习历史进行智能诊断
2. **交互式学习画布** - 可视化的知识图谱作为学习工作区
3. **集成式学习闭环** - 诊断、学习、练习、评估无缝衔接

### 技术架构

#### 后端技术栈

- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0
- **ORM**: Spring Data JPA + Hibernate
- **构建工具**: Maven
- **Java版本**: 17

#### 核心特性

- RESTful API设计
- 自动数据库表结构生成
- 事务管理
- 全局异常处理
- CORS跨域支持

### 系统功能模块

#### 1. 知识图谱管理

- 课程和知识点管理
- 知识点关系建模（前置、包含、相关）
- 可视化图谱数据生成

#### 2. 学习诊断系统

- 成绩数据导入和分析
- 薄弱知识点识别
- 掌握程度评估（薄弱/中等/熟练）

#### 3. 个性化学习工具

- 知识点笔记管理
- 富文本笔记支持
- 附件管理功能

#### 4. 自测评估系统

- 随机题目生成
- 实时测验评分
- 学习历史追踪

### 数据模型设计

系统包含8个核心实体：

- **User** - 用户信息
- **Course** - 课程信息
- **KnowledgePoint** - 知识点
- **KnowledgeRelation** - 知识点关系
- **UserScore** - 用户成绩
- **UserNote** - 用户笔记
- **Question** - 测验题目
- **QuizAttempt** - 测验记录

### 开发环境配置

#### 数据库配置

```yaml
数据库: MySQL
数据库名: reviewpilot
字符集: utf8mb4
端口: 3306
```

#### 应用配置

```yaml
服务端口: 8080
API路径: /api
前端地址: http://localhost:3000
```

### 项目结构

```t
reviewpilot/
├── entity/          # 数据实体类
├── repository/      # 数据访问层
├── service/         # 业务逻辑层
├── controller/      # API控制层
├── config/          # 配置类
└── handler/         # 异常处理
```

### 快速开始

#### 1. 环境要求

- Java 17+
- MySQL 8.0+
- Maven 3.6+

#### 2. 数据库设置

```sql
CREATE DATABASE reviewpilot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. 应用启动

```bash
mvn spring-boot:run
```

#### 4. API测试

访问 `http://localhost:8080/api/courses` 测试接口连通性

### 前端集成指南

#### 核心API调用示例

```javascript
// 获取知识图谱
const response = await fetch('/api/courses/1/knowledge-graph?userId=1');
const graphData = await response.json();

// 保存笔记
await fetch('/api/user/knowledge-points/1/user-note?userId=1', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({content: '笔记内容'})
});
```

#### 状态管理建议

- 使用Pinia管理课程状态
- 知识图谱数据缓存优化
- 用户学习进度本地存储

### 扩展规划

#### 短期功能

- 用户认证系统
- 文件上传功能
- 学习进度分析报告

#### 长期规划

- 智能推荐算法
- 移动端适配
- 第三方集成

### 贡献指南

欢迎提交Issue和Pull Request，共同完善这个学习导航平台！
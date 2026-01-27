# ReviewPilot

## 项目简介

ReviewPilot 是一个前后端分离的学习管理系统，后端采用 Spring Boot，前端采用 React + Vite。

## 系统要求

### 后端环境要求
- **Java**: JDK 25
- **Maven**: 3.9 
- **数据库**: H2 内存数据库（已集成，无需额外安装）

### 前端环境要求
- **Node.js**: Node.js 24
- **npm**: 随 Node.js 一起安装

## 系统配置

### 后端配置

后端配置文件位于 `backend/src/main/resources/application.yaml`：

- **应用名称**: backend
- **数据库**: H2 内存数据库（`jdbc:h2:mem:testdb;MODE=MySQL`）
- **默认端口**: 8080
- **H2 控制台**: 启用，访问路径 `/h2-console`
- **数据初始化**: 自动执行 `data.sql` 初始化数据

### 前端配置

前端配置文件位于 `frontend/vite.config.ts`：

- **开发服务器端口**: 5173
- **API 代理**: `/api` 请求代理到 `http://localhost:8080`

## 运行步骤

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 运行 Spring Boot 应用
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动。

**注意**: 首次运行时会自动下载 Maven 依赖，可能需要一些时间。应用启动时会自动执行 `data.sql` 初始化数据。

### 2. 启动前端服务

打开**新的终端窗口**，执行以下命令：

```bash
# 进入前端目录
cd frontend

# 安装依赖（首次运行或依赖更新时需要）
npm i

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动。

## 访问地址

- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:8080/api
  - JDBC URL: `jdbc:h2:mem:testdb`
  - 用户名: `sa`
  - 密码: （空）

## 常见问题

### 后端启动失败

1. **检查 Java 版本**: 确保已安装 JDK 25
   ```bash
   java -version
   ```

2. **检查 Maven 配置**: 确保 Maven 已正确安装
   ```bash
   mvn -version
   ```

3. **端口占用**: 如果 8080 端口被占用，可以修改 `application.yaml` 中的端口配置

### 前端启动失败

1. **检查 Node.js 版本**: 确保已安装 Node.js 24
   ```bash
   node -version
   ```

2. **清除缓存重新安装**: 如果依赖安装失败，可以尝试：
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm i
   ```

### 前后端连接问题

- 确保后端服务已启动在 `http://localhost:8080`
- 检查前端代理配置是否正确（`frontend/vite.config.ts`）
- 查看浏览器控制台和终端错误信息

## 注意事项

1. **运行顺序**: 建议先启动后端服务，再启动前端服务
2. **数据库**: 使用 H2 内存数据库，重启后端后数据会清空，但会重新执行 `data.sql` 初始化
3. **跨域**: 前端已配置代理，无需额外处理跨域问题
4. **依赖安装**: 首次运行前端时务必执行 `npm i` 安装依赖

## 开发命令

### 后端
- `mvn spring-boot:run` - 启动开发服务器
- `mvn clean package` - 打包项目

### 前端
- `npm i` - 安装依赖
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run format` - 格式化代码
- `npm run update` - 升级项目依赖

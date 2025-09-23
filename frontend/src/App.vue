<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="app-header">
        <div class="header-content">
          <h1>ReviewPilot</h1>
          <p>基于知识图谱的个性化复习导航系统</p>
        </div>
      </el-header>

      <el-container>
        <el-aside width="250px" class="sidebar">
          <el-menu
              router
              :default-active="$route.path"
              class="sidebar-menu"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/courses">
              <el-icon><Reading /></el-icon>
              <span>课程管理</span>
            </el-menu-item>
            <el-menu-item index="/knowledge-graph">
              <el-icon><Connection /></el-icon>
              <span>知识图谱</span>
            </el-menu-item>
            <el-menu-item index="/quiz">
              <el-icon><EditPen /></el-icon>
              <span>智能测验</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { House, Reading, Connection, EditPen } from '@element-plus/icons-vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
}

.header-content p {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 14px;
}

.sidebar {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

.main-content {
  padding: 20px;
  background-color: #fafbfc;
}
</style>
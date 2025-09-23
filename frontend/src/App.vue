<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo-section">
            <el-icon class="logo-icon"><Connection /></el-icon>
            <div class="title-section">
              <h1>ReviewPilot</h1>
              <p>基于知识图谱的个性化复习导航系统</p>
            </div>
          </div>
          <div class="user-info">
            <el-avatar :size="40" :src="userAvatar" />
            <span class="user-name">学生用户</span>
          </div>
        </div>
      </el-header>

      <el-container class="main-container">
        <el-aside width="260px" class="sidebar">
          <el-menu
              router
              :default-active="$route.path"
              class="sidebar-menu"
              background-color="#f8fafc"
              active-text-color="#409eff"
          >
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

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Reading, Connection, EditPen } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'App',
  components: {
    Reading,
    Connection,
    EditPen
  },
  setup() {
    const userAvatar = ref('')

    return {
      userAvatar
    }
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  opacity: 0.9;
}

.title-section h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.title-section p {
  margin: 4px 0 0 0;
  opacity: 0.9;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 500;
}

.main-container {
  height: calc(100vh - 60px);
}

.sidebar {
  background-color: #f8fafc;
  border-right: 1px solid #e4e7ed;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.sidebar-menu {
  border: none;
  padding-top: 20px;
}

.sidebar-menu .el-menu-item {
  height: 56px;
  margin: 4px 12px;
  border-radius: 8px;
  font-weight: 500;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  border-right: 3px solid #409eff;
}

.main-content {
  padding: 24px;
  background-color: #fafbfc;
  overflow-y: auto;
}
</style>
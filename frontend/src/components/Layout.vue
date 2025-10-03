<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <el-icon><Reading /></el-icon>
          <span>ReviewPilot</span>
        </div>
        <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            router
            class="nav-menu"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/courses">
            <el-icon><Notebook /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="/knowledge-graph">
            <el-icon><DataAnalysis /></el-icon>
            <span>知识图谱</span>
          </el-menu-item>
          <el-menu-item index="/quiz">
            <el-icon><EditPen /></el-icon>
            <span>智能测验</span>
          </el-menu-item>
        </el-menu>
        <div class="user-info">
          <el-icon><User /></el-icon>
          <span>{{ store.currentUser.realName }}</span>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <slot />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import {
  House,
  Notebook,
  DataAnalysis,
  EditPen,
  User,
  Reading
} from '@element-plus/icons-vue'

const route = useRoute()
const store = useAppStore()

const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.logo .el-icon {
  margin-right: 8px;
  font-size: 24px;
}

.nav-menu {
  flex: 1;
  justify-content: center;
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  color: #666;
}

.user-info .el-icon {
  margin-right: 8px;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>
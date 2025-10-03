<template>
  <div class="courses">
    <div class="page-header">
      <h1>课程管理</h1>
      <p>选择课程开始学习之旅</p>
    </div>
    <CourseList />
  </div>
</template>

<script setup lang="ts">
import CourseList from '../components/CourseList.vue'
</script>

<style scoped>
.courses {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h1 {
  margin-bottom: 10px;
  color: #303133;
}

.page-header p {
  color: #606266;
  font-size: 16px;
}
</style>
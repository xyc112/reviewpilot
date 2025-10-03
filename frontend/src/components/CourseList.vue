<template>
  <div class="course-list">
    <el-row :gutter="20">
      <el-col
          v-for="course in store.courses"
          :key="course.courseId"
          :span="8"
          class="mb-20"
      >
        <el-card class="course-card" shadow="hover">
          <template #header>
            <div class="course-header">
              <h3>{{ course.courseName }}</h3>
              <el-tag type="primary">{{ course.credit }}学分</el-tag>
            </div>
          </template>

          <div class="course-info">
            <p><strong>授课教师:</strong> {{ course.teacher }}</p>
            <p><strong>学期:</strong> {{ course.semester }}</p>
            <p class="syllabus">{{ course.syllabus }}</p>
          </div>

          <template #footer v-if="showActions">
            <div class="course-actions">
              <el-button type="primary" @click="selectCourse(course)">
                进入课程
              </el-button>
              <el-button @click="viewDetails(course)">
                查看详情
              </el-button>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import type { Course } from '../types'

interface Props {
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  showActions: true
})

const store = useAppStore()
const router = useRouter()

const selectCourse = (course: Course) => {
  store.selectCourse(course)
  router.push('/knowledge-graph')
}

const viewDetails = (course: Course) => {
  store.selectCourse(course)
  // 可以跳转到课程详情页
  ElMessage.info(`查看课程: ${course.courseName}`)
}
</script>

<style scoped>
.course-card {
  height: 280px;
  display: flex;
  flex-direction: column;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-header h3 {
  margin: 0;
  color: #303133;
}

.course-info {
  flex: 1;
}

.course-info p {
  margin: 8px 0;
  color: #606266;
}

.syllabus {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
}

.course-actions {
  display: flex;
  justify-content: space-between;
}

.mb-20 {
  margin-bottom: 20px;
}
</style>
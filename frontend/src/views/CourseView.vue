<template>
  <div class="course-view">
    <div class="view-header">
      <h2>课程管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        创建新课程
      </el-button>
    </div>

    <el-table :data="courses" v-loading="loading">
      <el-table-column prop="courseId" label="ID" width="80" />
      <el-table-column prop="courseName" label="课程名称" />
      <el-table-column prop="syllabus" label="课程描述" show-overflow-tooltip />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="selectCourse(scope.row)">
            查看图谱
          </el-button>
          <el-button size="small" type="primary" @click="enterQuiz(scope.row)">
            开始测验
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showCreateDialog" title="创建课程">
      <el-form :model="newCourse" label-width="80px">
        <el-form-item label="课程名称">
          <el-input v-model="newCourse.courseName" />
        </el-form-item>
        <el-form-item label="课程描述">
          <el-input v-model="newCourse.syllabus" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createCourse">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCourseStore } from '@/stores/courseStore'
import type { Course } from '@/types/api'

const router = useRouter()
const courseStore = useCourseStore()

const courses = ref<Course[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const newCourse = ref({
  courseName: '',
  syllabus: ''
})

const fetchCourses = async () => {
  loading.value = true
  try {
    await courseStore.fetchCourses()
    courses.value = courseStore.courses
  } catch (error) {
    ElMessage.error('获取课程列表失败')
  } finally {
    loading.value = false
  }
}

const createCourse = async () => {
  try {
    await courseStore.createCourse(newCourse.value)
    showCreateDialog.value = false
    ElMessage.success('课程创建成功')
    fetchCourses()
  } catch (error) {
    ElMessage.error('创建课程失败')
  }
}

const selectCourse = (course: Course) => {
  courseStore.currentCourse = course
  router.push('/knowledge-graph')
}

const enterQuiz = (course: Course) => {
  courseStore.currentCourse = course
  router.push('/quiz')
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
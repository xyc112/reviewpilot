<template>
  <div class="course-view">
    <div class="view-header">
      <div class="header-title">
        <h2>课程管理</h2>
        <p>管理您的学习课程，查看知识图谱并进行测验</p>
      </div>
      <el-button type="primary" @click="showCreateDialog = true" icon="Plus">
        创建新课程
      </el-button>
    </div>

    <el-card class="course-card">
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
          <el-button text @click="refreshCourses" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="courses" v-loading="loading" empty-text="暂无课程数据">
        <el-table-column prop="courseId" label="ID" width="80" align="center" />
        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        <el-table-column prop="syllabus" label="课程描述" show-overflow-tooltip min-width="200" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="selectCourse(scope.row)" type="primary" plain>
              查看图谱
            </el-button>
            <el-button size="small" @click="enterQuiz(scope.row)" type="success">
              开始测验
            </el-button>
            <el-button size="small" @click="viewCourseDetails(scope.row)" text>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建课程对话框 -->
    <el-dialog
        v-model="showCreateDialog"
        title="创建新课程"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form
          :model="newCourse"
          :rules="courseRules"
          ref="courseForm"
          label-width="100px"
          label-position="left"
      >
        <el-form-item label="课程名称" prop="courseName" required>
          <el-input
              v-model="newCourse.courseName"
              placeholder="请输入课程名称"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>
        <el-form-item label="课程描述" prop="syllabus">
          <el-input
              v-model="newCourse.syllabus"
              type="textarea"
              placeholder="请输入课程描述"
              :rows="4"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createCourse" :loading="creating">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { useCourseStore } from '@/stores/courseStore'
import type { Course } from '@/types/api'

export default defineComponent({
  name: 'CourseView',
  components: {
    Plus,
    Refresh
  },
  setup() {
    const router = useRouter()
    const courseStore = useCourseStore()

    const courses = ref<Course[]>([])
    const loading = ref(false)
    const showCreateDialog = ref(false)
    const creating = ref(false)
    const newCourse = ref({
      courseName: '',
      syllabus: ''
    })

    const courseRules = {
      courseName: [
        { required: true, message: '请输入课程名称', trigger: 'blur' },
        { min: 2, max: 50, message: '课程名称长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      syllabus: [
        { max: 200, message: '课程描述不能超过 200 个字符', trigger: 'blur' }
      ]
    }

    const fetchCourses = async (): Promise<void> => {
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

    const refreshCourses = (): void => {
      fetchCourses()
    }

    const createCourse = async (): Promise<void> => {
      creating.value = true
      try {
        await courseStore.createCourse(newCourse.value)
        showCreateDialog.value = false
        newCourse.value = { courseName: '', syllabus: '' }
        ElMessage.success('课程创建成功')
        await fetchCourses()
      } catch (error) {
        ElMessage.error('创建课程失败')
      } finally {
        creating.value = false
      }
    }

    const selectCourse = (course: Course): void => {
      courseStore.currentCourse = course
      router.push('/knowledge-graph')
    }

    const enterQuiz = (course: Course): void => {
      courseStore.currentCourse = course
      router.push('/quiz')
    }

    const viewCourseDetails = (course: Course): void => {
      ElMessage.info(`查看课程详情: ${course.courseName}`)
      // 实现课程详情查看功能
    }

    onMounted(() => {
      fetchCourses()
    })

    return {
      courses,
      loading,
      showCreateDialog,
      creating,
      newCourse,
      courseRules,
      fetchCourses,
      refreshCourses,
      createCourse,
      selectCourse,
      enterQuiz,
      viewCourseDetails
    }
  }
})
</script>

<style scoped>
.course-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.header-title h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.header-title p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.course-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: #f8fafc;
  font-weight: 600;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-title {
    text-align: center;
  }
}
</style>
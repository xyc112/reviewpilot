<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>学习进度</span>
            </div>
          </template>
          <div class="stat-content">
            <el-progress
                type="circle"
                :percentage="75"
                :width="100"
                color="#409eff"
            />
            <div class="stat-info">
              <h3>75%</h3>
              <p>已完成 30/40 个知识点</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>平均掌握度</span>
            </div>
          </template>
          <div class="stat-content">
            <el-progress
                type="circle"
                :percentage="68"
                :width="100"
                color="#67c23a"
            />
            <div class="stat-info">
              <h3>68%</h3>
              <p>需要加强薄弱环节</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>测验成绩</span>
            </div>
          </template>
          <div class="stat-content">
            <el-progress
                type="circle"
                :percentage="82"
                :width="100"
                color="#e6a23c"
            />
            <div class="stat-info">
              <h3>82%</h3>
              <p>最近测验平均分</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近学习的课程</span>
            </div>
          </template>
          <CourseList :show-actions="false" />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>薄弱知识点</span>
            </div>
          </template>
          <el-table :data="weakPoints" style="width: 100%">
            <el-table-column prop="name" label="知识点" />
            <el-table-column prop="masteryScore" label="掌握度">
              <template #default="{ row }">
                <el-tag :type="getMasteryType(row.masteryLevel)">
                  {{ row.masteryScore }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" link @click="reviewPoint(row)">
                  复习
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import CourseList from '../components/CourseList.vue'
import type { KnowledgePoint } from '../types'

const store = useAppStore()
const router = useRouter()

const weakPoints = computed(() =>
    store.knowledgePoints.filter(point => point.masteryLevel === 'weak')
)

const getMasteryType = (level: string) => {
  const types: { [key: string]: string } = {
    weak: 'danger',
    medium: 'warning',
    strong: 'success'
  }
  return types[level] || 'info'
}

const reviewPoint = (point: KnowledgePoint) => {
  store.selectKnowledgePoint(point)
  router.push('/knowledge-graph')
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  text-align: center;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #409eff;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
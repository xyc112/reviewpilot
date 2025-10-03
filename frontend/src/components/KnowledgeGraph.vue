<template>
  <div class="knowledge-graph">
    <el-card>
      <template #header>
        <div class="graph-header">
          <span>知识图谱可视化</span>
          <div class="graph-controls">
            <el-button type="primary" @click="generateGraph">
              <el-icon><Refresh /></el-icon>
              刷新图谱
            </el-button>
          </div>
        </div>
      </template>

      <div class="graph-container">
        <div class="graph-placeholder">
          <el-empty description="知识图谱可视化区域">
            <template #image>
              <el-icon :size="80"><DataAnalysis /></el-icon>
            </template>
            <p>这里将使用 ECharts 或 D3.js 展示交互式知识图谱</p>
            <el-button type="primary" @click="generateGraph">
              生成示例图谱
            </el-button>
          </el-empty>
        </div>
      </div>

      <div class="knowledge-points">
        <h3>知识点列表</h3>
        <el-table :data="store.knowledgePoints" style="width: 100%">
          <el-table-column prop="name" label="知识点名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="masteryLevel" label="掌握程度">
            <template #default="{ row }">
              <el-tag :type="getMasteryType(row.masteryLevel)">
                {{ getMasteryText(row.masteryLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="masteryScore" label="掌握分数" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewNotes(row)">
                查看笔记
              </el-button>
              <el-button type="primary" link @click="takeQuiz(row)">
                开始测验
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <UserNotes
        v-if="showNotes"
        :point="selectedPoint"
        @close="showNotes = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import UserNotes from './UserNotes.vue'
import { Refresh, DataAnalysis } from '@element-plus/icons-vue'
import type { KnowledgePoint } from '../types'

const store = useAppStore()
const router = useRouter()
const showNotes = ref(false)
const selectedPoint = ref<KnowledgePoint | null>(null)

const generateGraph = () => {
  ElMessage.success('知识图谱已生成（示例数据）')
}

const getMasteryType = (level: string) => {
  const types: { [key: string]: string } = {
    weak: 'danger',
    medium: 'warning',
    strong: 'success'
  }
  return types[level] || 'info'
}

const getMasteryText = (level: string) => {
  const texts: { [key: string]: string } = {
    weak: '薄弱',
    medium: '中等',
    strong: '熟练'
  }
  return texts[level] || '未知'
}

const viewNotes = (point: KnowledgePoint) => {
  selectedPoint.value = point
  showNotes.value = true
}

const takeQuiz = (point: KnowledgePoint) => {
  store.selectKnowledgePoint(point)
  router.push('/quiz')
}
</script>

<style scoped>
.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.graph-container {
  height: 400px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  margin-bottom: 20px;
  background: #fafafa;
}

.graph-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.knowledge-points {
  margin-top: 20px;
}
</style>
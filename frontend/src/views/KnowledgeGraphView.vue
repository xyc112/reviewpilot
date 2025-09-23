<template>
  <div class="knowledge-graph-view">
    <div class="view-header">
      <div class="header-title">
        <h2>知识图谱</h2>
        <p v-if="currentCourse">{{ currentCourse.courseName }} - 可视化知识结构</p>
        <p v-else>请先选择课程以查看知识图谱</p>
      </div>
      <div class="header-actions">
        <el-button
            @click="refreshGraph"
            :loading="loading"
            :disabled="!currentCourse"
            icon="Refresh"
        >
          刷新
        </el-button>
        <el-button
            type="primary"
            @click="showCreatePointDialog = true"
            :disabled="!currentCourse"
            icon="Plus"
        >
          添加知识点
        </el-button>
      </div>
    </div>

    <!-- 课程选择提示 -->
    <el-card v-if="!currentCourse" class="empty-state-card">
      <el-empty description="请先选择课程">
        <el-button type="primary" @click="goToCourses">前往课程管理</el-button>
      </el-empty>
    </el-card>

    <!-- 知识图谱内容 -->
    <div v-else>
      <!-- 统计信息卡片 -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6">
          <el-statistic title="总知识点数" :value="knowledgeGraph?.nodes.length || 0" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="平均掌握度" :value="averageMasteryScore" suffix="%" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="薄弱知识点" :value="weakPointsCount" class="weak-points" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="学习进度" :value="learningProgress" suffix="%" />
        </el-col>
      </el-row>

      <!-- 知识图谱可视化区域 -->
      <el-card class="graph-card" v-loading="loading">
        <template #header>
          <div class="card-header">
            <span>知识图谱可视化</span>
            <div class="legend">
              <span class="legend-item">
                <span class="legend-color proficient"></span>
                熟练
              </span>
              <span class="legend-item">
                <span class="legend-color medium"></span>
                中等
              </span>
              <span class="legend-item">
                <span class="legend-color weak"></span>
                薄弱
              </span>
            </div>
          </div>
        </template>

        <div v-if="!knowledgeGraph || knowledgeGraph.nodes.length === 0" class="empty-graph">
          <el-empty description="暂无知识图谱数据">
            <el-button type="primary" @click="showCreatePointDialog = true">
              添加第一个知识点
            </el-button>
          </el-empty>
        </div>

        <div v-else class="graph-content">
          <!-- 知识点网格布局 -->
          <div class="knowledge-grid">
            <div
                v-for="node in knowledgeGraph.nodes"
                :key="node.id"
                :class="['knowledge-node', `mastery-${node.masteryLevel}`]"
                @click="viewNodeDetails(node)"
            >
              <div class="node-header">
                <h4 class="node-title">{{ node.name }}</h4>
                <el-tag :type="getMasteryTagType(node.masteryLevel)" size="small" effect="dark">
                  {{ getMasteryText(node.masteryLevel) }}
                </el-tag>
              </div>
              <p class="node-description">{{ node.description }}</p>
              <div class="node-footer">
                <span class="mastery-score">{{ node.masteryScore }}%</span>
                <div class="node-actions">
                  <el-button size="small" circle @click.stop="takeQuiz(node.id)" icon="EditPen" />
                  <el-button size="small" circle @click.stop="viewNotes(node.id)" icon="Notebook" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建知识点对话框 -->
    <el-dialog
        v-model="showCreatePointDialog"
        title="添加知识点"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form
          :model="newKnowledgePoint"
          :rules="pointRules"
          ref="pointForm"
          label-width="100px"
          label-position="left"
      >
        <el-form-item label="知识点名称" prop="pointName" required>
          <el-input
              v-model="newKnowledgePoint.pointName"
              placeholder="请输入知识点名称"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>
        <el-form-item label="知识点描述" prop="description">
          <el-input
              v-model="newKnowledgePoint.description"
              type="textarea"
              placeholder="请输入知识点描述"
              :rows="4"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreatePointDialog = false">取消</el-button>
        <el-button type="primary" @click="createKnowledgePoint" :loading="creatingPoint">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 知识点详情侧边栏 -->
    <el-drawer
        v-model="showNodeDetails"
        title="知识点详情"
        direction="rtl"
        size="400px"
    >
      <div v-if="selectedNode" class="node-details">
        <h3>{{ selectedNode.name }}</h3>
        <el-divider />
        <div class="detail-item">
          <label>描述：</label>
          <p>{{ selectedNode.description }}</p>
        </div>
        <div class="detail-item">
          <label>掌握程度：</label>
          <el-tag :type="getMasteryTagType(selectedNode.masteryLevel)" effect="dark">
            {{ getMasteryText(selectedNode.masteryLevel) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label>掌握分数：</label>
          <el-progress
              :percentage="selectedNode.masteryScore"
              :status="getMasteryProgressStatus(selectedNode.masteryLevel)"
              :stroke-width="8"
          />
        </div>

        <el-divider />
        <div class="detail-actions">
          <el-button type="primary" @click="takeQuiz(selectedNode.id)" icon="EditPen">
            进行测验
          </el-button>
          <el-button type="success" @click="viewNotes(selectedNode.id)" icon="Notebook">
            查看笔记
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Plus, EditPen, Notebook } from '@element-plus/icons-vue'
import { useCourseStore } from '@/stores/courseStore'
import { knowledgeGraphService } from '@/services/api'
import type { KnowledgeNode, CreateKnowledgePointRequest } from '@/types/api'

export default defineComponent({
  name: 'KnowledgeGraphView',
  components: {
    Refresh,
    Plus,
    EditPen,
    Notebook
  },
  setup() {
    const router = useRouter()
    const courseStore = useCourseStore()

    const loading = ref(false)
    const showCreatePointDialog = ref(false)
    const showNodeDetails = ref(false)
    const creatingPoint = ref(false)
    const selectedNode = ref<KnowledgeNode | null>(null)
    const newKnowledgePoint = ref<CreateKnowledgePointRequest>({
      pointName: '',
      description: ''
    })

    const pointRules = {
      pointName: [
        { required: true, message: '请输入知识点名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      description: [
        { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
      ]
    }

    // 计算属性
    const currentCourse = computed(() => courseStore.currentCourse)
    const knowledgeGraph = computed(() => courseStore.knowledgeGraph)

    const averageMasteryScore = computed((): number => {
      if (!knowledgeGraph.value || knowledgeGraph.value.nodes.length === 0) return 0
      const total = knowledgeGraph.value.nodes.reduce((sum, node) => sum + node.masteryScore, 0)
      return Math.round(total / knowledgeGraph.value.nodes.length)
    })

    const weakPointsCount = computed((): number => {
      if (!knowledgeGraph.value) return 0
      return knowledgeGraph.value.nodes.filter(node => node.masteryLevel === 'weak').length
    })

    const learningProgress = computed((): number => {
      if (!knowledgeGraph.value || knowledgeGraph.value.nodes.length === 0) return 0
      const mastered = knowledgeGraph.value.nodes.filter(node => node.masteryLevel === 'proficient').length
      return Math.round((mastered / knowledgeGraph.value.nodes.length) * 100)
    })

    // 方法
    const loadKnowledgeGraph = async (): Promise<void> => {
      if (!currentCourse.value) return

      loading.value = true
      try {
        await courseStore.fetchKnowledgeGraph(currentCourse.value.courseId)
      } catch (error) {
        ElMessage.error('加载知识图谱失败')
        console.error('加载知识图谱错误:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshGraph = async (): Promise<void> => {
      if (!currentCourse.value) {
        ElMessage.warning('请先选择课程')
        return
      }
      await loadKnowledgeGraph()
    }

    const createKnowledgePoint = async (): Promise<void> => {
      if (!currentCourse.value) {
        ElMessage.warning('请先选择课程')
        return
      }

      creatingPoint.value = true
      try {
        await knowledgeGraphService.createKnowledgePoint(
            currentCourse.value.courseId,
            newKnowledgePoint.value
        )

        ElMessage.success('知识点创建成功')
        showCreatePointDialog.value = false
        newKnowledgePoint.value = { pointName: '', description: '' }
        await loadKnowledgeGraph()
      } catch (error: any) {
        console.error('创建知识点错误:', error)
        ElMessage.error(`创建知识点失败: ${error.error || '未知错误'}`)
      } finally {
        creatingPoint.value = false
      }
    }

    const viewNodeDetails = (node: KnowledgeNode): void => {
      selectedNode.value = node
      showNodeDetails.value = true
    }

    const takeQuiz = (nodeId: string): void => {
      ElMessage.info(`开始测验知识点: ${nodeId}`)
      router.push('/quiz')
    }

    const viewNotes = (nodeId: string): void => {
      ElMessage.info(`查看笔记: ${nodeId}`)
      // 实现查看笔记功能
    }

    const goToCourses = (): void => {
      router.push('/courses')
    }

    const getMasteryTagType = (level: string): string => {
      const map: { [key: string]: string } = {
        weak: 'danger',
        medium: 'warning',
        proficient: 'success'
      }
      return map[level] || 'info'
    }

    const getMasteryText = (level: string): string => {
      const map: { [key: string]: string } = {
        weak: '薄弱',
        medium: '中等',
        proficient: '熟练'
      }
      return map[level] || '未知'
    }

    const getMasteryProgressStatus = (level: string): string => {
      const map: { [key: string]: string } = {
        weak: 'exception',
        medium: 'warning',
        proficient: 'success'
      }
      return map[level] || 'success'
    }

    onMounted(() => {
      loadKnowledgeGraph()
    })

    return {
      loading,
      showCreatePointDialog,
      showNodeDetails,
      creatingPoint,
      selectedNode,
      newKnowledgePoint,
      pointRules,
      currentCourse,
      knowledgeGraph,
      averageMasteryScore,
      weakPointsCount,
      learningProgress,
      loadKnowledgeGraph,
      refreshGraph,
      createKnowledgePoint,
      viewNodeDetails,
      takeQuiz,
      viewNotes,
      goToCourses,
      getMasteryTagType,
      getMasteryText,
      getMasteryProgressStatus
    }
  }
})
</script>

<style scoped>
.knowledge-graph-view {
  max-width: 1400px;
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

.header-actions {
  display: flex;
  gap: 12px;
}

.empty-state-card {
  text-align: center;
  padding: 40px 0;
}

.stats-row {
  margin-bottom: 20px;
}

:deep(.el-col) {
  margin-bottom: 16px;
}

.weak-points :deep(.el-statistic__number) {
  color: #f56c6c;
}

.graph-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #606266;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-color.proficient {
  background-color: #67c23a;
}

.legend-color.medium {
  background-color: #e6a23c;
}

.legend-color.weak {
  background-color: #f56c6c;
}

.empty-graph {
  padding: 60px 0;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 8px;
}

.knowledge-node {
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.knowledge-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.knowledge-node.mastery-proficient {
  border-color: #67c23a;
}

.knowledge-node.mastery-medium {
  border-color: #e6a23c;
}

.knowledge-node.mastery-weak {
  border-color: #f56c6c;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.node-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  margin-right: 8px;
}

.node-description {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.node-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mastery-score {
  font-weight: 600;
  color: #409eff;
}

.node-actions {
  display: flex;
  gap: 4px;
}

.node-details {
  padding: 8px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.detail-item p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
  }

  .stats-row .el-col {
    margin-bottom: 12px;
  }
}
</style>
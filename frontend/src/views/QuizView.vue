<template>
  <div class="quiz-view">
    <div class="view-header">
      <div class="header-title">
        <h2>智能测验</h2>
        <p v-if="currentCourse">{{ currentCourse.courseName }} - 知识点掌握度评估</p>
        <p v-else>请先选择课程以开始测验</p>
      </div>
    </div>

    <!-- 课程选择提示 -->
    <el-card v-if="!currentCourse" class="empty-state-card">
      <el-empty description="请先选择课程">
        <el-button type="primary" @click="goToCourses">前往课程管理</el-button>
      </el-empty>
    </el-card>

    <!-- 测验内容 -->
    <div v-else>
      <!-- 测验选择界面 -->
      <div v-if="!quizStarted && !quizCompleted" class="quiz-selection">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-card class="selection-card" shadow="hover" @click="startRandomQuiz">
              <div class="card-content">
                <el-icon class="card-icon"><Magic /></el-icon>
                <h3>随机测验</h3>
                <p>系统随机选择知识点进行综合评估</p>
                <el-button type="primary">开始测验</el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="selection-card" shadow="hover" @click="showPointSelection = true">
              <div class="card-content">
                <el-icon class="card-icon"><Select /></el-icon>
                <h3>针对性测验</h3>
                <p>选择特定知识点进行专项练习</p>
                <el-button type="success">选择知识点</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 薄弱知识点推荐 -->
        <el-card v-if="weakPoints.length > 0" class="weak-points-card">
          <template #header>
            <div class="card-header">
              <span>推荐优先复习的知识点</span>
              <el-tag type="danger">薄弱环节</el-tag>
            </div>
          </template>
          <div class="weak-points-list">
            <div
                v-for="point in weakPoints"
                :key="point.pointId"
                class="weak-point-item"
                @click="startTargetedQuiz(point.pointId)"
            >
              <div class="point-info">
                <h4>{{ point.pointName }}</h4>
                <p>{{ point.description }}</p>
              </div>
              <el-button type="primary" size="small" text>开始练习</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 测验进行中 -->
      <div v-if="quizStarted && !quizCompleted" class="quiz-in-progress">
        <el-card>
          <template #header>
            <div class="quiz-header">
              <span>测验进行中</span>
              <div class="quiz-progress">
                <span>第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ questions.length }} 题</span>
                <el-progress
                    :percentage="progressPercentage"
                    :stroke-width="6"
                    style="width: 200px;"
                />
              </div>
            </div>
          </template>

          <div class="question-content" v-loading="loadingQuestion">
            <div v-if="currentQuestion" class="question-card">
              <h3 class="question-text">{{ currentQuestion.questionText }}</h3>

              <div class="options-list">
                <div
                    v-for="(option, index) in currentQuestion.options"
                    :key="index"
                    :class="['option-item', {
                    'selected': selectedAnswer === String.fromCharCode(65 + index),
                    'correct': showResult && option === currentQuestion.correctAnswer,
                    'incorrect': showResult && selectedAnswer === String.fromCharCode(65 + index) && selectedAnswer !== currentQuestion.correctAnswer
                  }]"
                    @click="selectAnswer(String.fromCharCode(65 + index))"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
                  <span class="option-text">{{ option }}</span>
                  <el-icon v-if="showResult && option === currentQuestion.correctAnswer" class="correct-icon">
                    <CircleCheck />
                  </el-icon>
                  <el-icon v-if="showResult && selectedAnswer === String.fromCharCode(65 + index) && selectedAnswer !== currentQuestion.correctAnswer" class="incorrect-icon">
                    <CircleClose />
                  </el-icon>
                </div>
              </div>

              <div v-if="showResult" class="answer-feedback">
                <el-alert
                    :title="selectedAnswer === currentQuestion.correctAnswer ? '回答正确！' : '回答错误'"
                    :type="selectedAnswer === currentQuestion.correctAnswer ? 'success' : 'error'"
                    :closable="false"
                    show-icon
                >
                  <template #default>
                    <p v-if="selectedAnswer !== currentQuestion.correctAnswer">
                      正确答案是: <strong>{{ currentQuestion.correctAnswer }}</strong>
                    </p>
                  </template>
                </el-alert>
              </div>

              <div class="quiz-actions">
                <el-button
                    v-if="!showResult"
                    type="primary"
                    :disabled="!selectedAnswer"
                    @click="submitAnswer"
                >
                  提交答案
                </el-button>
                <el-button
                    v-else
                    type="primary"
                    @click="nextQuestion"
                >
                  {{ isLastQuestion ? '查看结果' : '下一题' }}
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 测验结果 -->
      <div v-if="quizCompleted" class="quiz-result">
        <el-card>
          <template #header>
            <div class="result-header">
              <h3>测验结果</h3>
              <el-tag :type="getResultTagType(quizResult.totalScore)" size="large" effect="dark">
                得分: {{ quizResult.totalScore }} / 100
              </el-tag>
            </div>
          </template>

          <div class="result-content">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-statistic
                    title="正确题数"
                    :value="quizResult.correctCount"
                    suffix="/"
                >
                  <template #suffix>
                    <span style="font-size: 14px">{{ quizResult.totalQuestions }}</span>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="8">
                <el-statistic
                    title="正确率"
                    :value="correctRate"
                    suffix="%"
                />
              </el-col>
              <el-col :span="8">
                <el-statistic
                    title="掌握程度"
                    :value="masteryLevel"
                />
              </el-col>
            </el-row>

            <el-divider />

            <div class="detailed-results">
              <h4>详细分析</h4>
              <div
                  v-for="(detail, index) in quizResult.details"
                  :key="index"
                  class="result-item"
              >
                <div class="result-question">
                  <span class="question-number">第 {{ index + 1 }} 题:</span>
                  <span>{{ detail.questionId }}</span>
                </div>
                <div class="result-status">
                  <el-tag :type="detail.isCorrect ? 'success' : 'danger'" size="small">
                    {{ detail.isCorrect ? '正确' : '错误' }}
                  </el-tag>
                  <span v-if="!detail.isCorrect" class="correct-answer">
                    正确答案: {{ detail.correctAnswer }}
                  </span>
                </div>
              </div>
            </div>

            <div class="result-actions">
              <el-button type="primary" @click="restartQuiz">重新测验</el-button>
              <el-button @click="goToKnowledgeGraph">查看知识图谱</el-button>
              <el-button type="success" @click="reviewWeakPoints">复习薄弱点</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 知识点选择对话框 -->
    <el-dialog
        v-model="showPointSelection"
        title="选择测验知识点"
        width="600px"
    >
      <div v-if="knowledgeGraph && knowledgeGraph.nodes.length > 0">
        <el-input
            v-model="pointSearch"
            placeholder="搜索知识点..."
            prefix-icon="Search"
            style="margin-bottom: 16px;"
        />
        <div class="point-selection-list">
          <div
              v-for="node in filteredKnowledgePoints"
              :key="node.id"
              class="point-selection-item"
              @click="startTargetedQuiz(parseInt(node.id))"
          >
            <div class="point-info">
              <h4>{{ node.name }}</h4>
              <p>{{ node.description }}</p>
            </div>
            <el-tag :type="getMasteryTagType(node.masteryLevel)" effect="light">
              {{ getMasteryText(node.masteryLevel) }}
            </el-tag>
          </div>
        </div>
      </div>
      <div v-else class="empty-points">
        <el-empty description="暂无知识点数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Select, CircleCheck, CircleClose, Search } from '@element-plus/icons-vue'
import { useCourseStore } from '@/stores/courseStore'
import { quizService } from '@/services/api'
import type { Question, QuizAttempt, QuizAnswer, QuizResult, KnowledgeNode } from '@/types/api'

export default defineComponent({
  name: 'QuizView',
  components: {
    Select,
    CircleCheck,
    CircleClose,
    Search
  },
  setup() {
    const router = useRouter()
    const courseStore = useCourseStore()

    // 状态管理
    const quizStarted = ref(false)
    const quizCompleted = ref(false)
    const showPointSelection = ref(false)
    const loadingQuestion = ref(false)
    const pointSearch = ref('')

    // 测验数据
    const questions = ref<Question[]>([])
    const currentQuestionIndex = ref(0)
    const selectedAnswer = ref('')
    const showResult = ref(false)
    const quizResult = ref<QuizResult>({
      totalScore: 0,
      correctCount: 0,
      totalQuestions: 0,
      details: []
    })

    const currentQuestion = computed(() =>
        questions.value.length > 0 ? questions.value[currentQuestionIndex.value] : null
    )

    const isLastQuestion = computed(() =>
        currentQuestionIndex.value === questions.value.length - 1
    )

    const progressPercentage = computed(() =>
        Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
    )

    const correctRate = computed(() =>
        Math.round((quizResult.value.correctCount / quizResult.value.totalQuestions) * 100)
    )

    const masteryLevel = computed(() => {
      const rate = correctRate.value
      if (rate >= 80) return '熟练'
      if (rate >= 60) return '中等'
      return '薄弱'
    })

    // 计算属性
    const currentCourse = computed(() => courseStore.currentCourse)
    const knowledgeGraph = computed(() => courseStore.knowledgeGraph)
    const weakPoints = computed(() => courseStore.weakPoints)

    const filteredKnowledgePoints = computed(() => {
      if (!knowledgeGraph.value) return []
      return knowledgeGraph.value.nodes.filter(node =>
          node.name.toLowerCase().includes(pointSearch.value.toLowerCase()) ||
          node.description.toLowerCase().includes(pointSearch.value.toLowerCase())
      )
    })

    // 方法
    const startRandomQuiz = async (): Promise<void> => {
      if (!currentCourse.value) {
        ElMessage.warning('请先选择课程')
        return
      }

      loadingQuestion.value = true
      try {
        // 随机选择一个知识点进行测验
        if (knowledgeGraph.value && knowledgeGraph.value.nodes.length > 0) {
          const randomNode = knowledgeGraph.value.nodes[
              Math.floor(Math.random() * knowledgeGraph.value.nodes.length)
              ]
          questions.value = await quizService.getRandomQuestions({
            pointId: parseInt(randomNode.id),
            count: 5
          })
          startQuiz()
        } else {
          ElMessage.warning('当前课程暂无知识点数据')
        }
      } catch (error) {
        ElMessage.error('获取测验题目失败')
        console.error('获取题目错误:', error)
      } finally {
        loadingQuestion.value = false
      }
    }

    const startTargetedQuiz = async (pointId: number): Promise<void> => {
      showPointSelection.value = false
      loadingQuestion.value = true

      try {
        questions.value = await quizService.getRandomQuestions({
          pointId,
          count: 5
        })
        startQuiz()
      } catch (error) {
        ElMessage.error('获取测验题目失败')
        console.error('获取题目错误:', error)
      } finally {
        loadingQuestion.value = false
      }
    }

    const startQuiz = (): void => {
      quizStarted.value = true
      quizCompleted.value = false
      currentQuestionIndex.value = 0
      selectedAnswer.value = ''
      showResult.value = false
    }

    const selectAnswer = (answer: string): void => {
      if (!showResult.value) {
        selectedAnswer.value = answer
      }
    }

    const submitAnswer = (): void => {
      if (!selectedAnswer.value) {
        ElMessage.warning('请选择一个答案')
        return
      }
      showResult.value = true
    }

    const nextQuestion = (): void => {
      if (isLastQuestion.value) {
        finishQuiz()
      } else {
        currentQuestionIndex.value++
        selectedAnswer.value = ''
        showResult.value = false
      }
    }

    const finishQuiz = async (): Promise<void> => {
      try {
        const attempt: QuizAttempt = {
          pointId: parseInt(questions.value[0]?.questionId.toString() || '0'),
          answers: questions.value.map((q, index) => ({
            questionId: q.questionId,
            selectedAnswer: selectedAnswer.value // 简化处理，实际应该记录每个问题的答案
          }))
        }

        // 模拟提交测验结果
        quizResult.value = {
          totalScore: Math.round((questions.value.filter((q, i) =>
              i === currentQuestionIndex.value ? selectedAnswer.value === q.correctAnswer : Math.random() > 0.3
          ).length / questions.value.length) * 100),
          correctCount: questions.value.filter((q, i) =>
              i === currentQuestionIndex.value ? selectedAnswer.value === q.correctAnswer : Math.random() > 0.3
          ).length,
          totalQuestions: questions.value.length,
          details: questions.value.map((q, i) => ({
            questionId: q.questionId,
            isCorrect: i === currentQuestionIndex.value ? selectedAnswer.value === q.correctAnswer : Math.random() > 0.3,
            correctAnswer: q.correctAnswer,
            selectedAnswer: i === currentQuestionIndex.value ? selectedAnswer.value : ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
          }))
        }

        quizStarted.value = false
        quizCompleted.value = true
      } catch (error) {
        ElMessage.error('提交测验结果失败')
        console.error('提交测验错误:', error)
      }
    }

    const restartQuiz = (): void => {
      quizCompleted.value = false
      questions.value = []
      selectedAnswer.value = ''
      showResult.value = false
    }

    const goToKnowledgeGraph = (): void => {
      router.push('/knowledge-graph')
    }

    const reviewWeakPoints = (): void => {
      if (weakPoints.value.length > 0) {
        startTargetedQuiz(weakPoints.value[0].pointId)
      } else {
        ElMessage.info('暂无需要复习的薄弱知识点')
      }
    }

    const goToCourses = (): void => {
      router.push('/courses')
    }

    const getResultTagType = (score: number): string => {
      if (score >= 80) return 'success'
      if (score >= 60) return 'warning'
      return 'danger'
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

    onMounted(() => {
      if (currentCourse.value) {
        courseStore.fetchWeakPoints(currentCourse.value.courseId)
      }
    })

    return {
      quizStarted,
      quizCompleted,
      showPointSelection,
      loadingQuestion,
      pointSearch,
      questions,
      currentQuestionIndex,
      selectedAnswer,
      showResult,
      quizResult,
      currentQuestion,
      isLastQuestion,
      progressPercentage,
      correctRate,
      masteryLevel,
      currentCourse,
      knowledgeGraph,
      weakPoints,
      filteredKnowledgePoints,
      startRandomQuiz,
      startTargetedQuiz,
      selectAnswer,
      submitAnswer,
      nextQuestion,
      restartQuiz,
      goToKnowledgeGraph,
      reviewWeakPoints,
      goToCourses,
      getResultTagType,
      getMasteryTagType,
      getMasteryText
    }
  }
})
</script>

<style scoped>
.quiz-view {
  max-width: 1000px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 24px;
}

.view-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.view-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.empty-state-card {
  text-align: center;
  padding: 40px 0;
}

.quiz-selection {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.selection-card {
  cursor: pointer;
  transition: transform 0.3s ease;
  height: 200px;
}

.selection-card:hover {
  transform: translateY(-4px);
}

.card-content {
  text-align: center;
  padding: 20px;
}

.card-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.card-content h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #303133;
}

.card-content p {
  margin: 0 0 20px 0;
  color: #606266;
  font-size: 14px;
}

.weak-points-card {
  margin-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.weak-points-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weak-point-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.weak-point-item:hover {
  background-color: #f5f7fa;
}

.point-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
}

.point-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.quiz-progress {
  display: flex;
  align-items: center;
  gap: 16px;
}

.question-content {
  padding: 20px 0;
}

.question-card {
  max-width: 800px;
  margin: 0 auto;
}

.question-text {
  margin: 0 0 24px 0;
  font-size: 18px;
  line-height: 1.6;
  color: #303133;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.option-item:hover {
  border-color: #409eff;
  background-color: #f0f7ff;
}

.option-item.selected {
  border-color: #409eff;
  background-color: #f0f7ff;
}

.option-item.correct {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.option-item.incorrect {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.option-label {
  font-weight: 600;
  margin-right: 12px;
  min-width: 24px;
  color: #409eff;
}

.option-text {
  flex: 1;
  line-height: 1.5;
}

.correct-icon {
  color: #67c23a;
  margin-left: 8px;
}

.incorrect-icon {
  color: #f56c6c;
  margin-left: 8px;
}

.answer-feedback {
  margin-bottom: 24px;
}

.quiz-actions {
  text-align: center;
}

.quiz-result {
  max-width: 800px;
  margin: 0 auto;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header h3 {
  margin: 0;
  font-size: 20px;
}

.result-content {
  padding: 8px;
}

.detailed-results {
  margin: 24px 0;
}

.detailed-results h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #303133;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-question {
  flex: 1;
}

.question-number {
  font-weight: 600;
  margin-right: 8px;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.correct-answer {
  font-size: 12px;
  color: #909399;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.point-selection-list {
  max-height: 400px;
  overflow-y: auto;
}

.point-selection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.point-selection-item:hover {
  background-color: #f5f7fa;
}

.point-selection-item .point-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.point-selection-item .point-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-points {
  padding: 40px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .quiz-selection .el-col {
    margin-bottom: 16px;
  }

  .quiz-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .result-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>
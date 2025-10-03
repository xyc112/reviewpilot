<template>
  <div class="quiz-panel">
    <el-card>
      <template #header>
        <div class="quiz-header">
          <h3>智能测验</h3>
          <div class="quiz-info" v-if="currentQuiz">
            <el-tag>剩余时间: {{ timeLeft }}秒</el-tag>
            <el-tag type="success">已答: {{ answeredCount }}/{{ currentQuiz.length }}</el-tag>
          </div>
        </div>
      </template>

      <div v-if="!quizStarted" class="quiz-setup">
        <el-form :model="quizConfig" label-width="120px">
          <el-form-item label="选择知识点">
            <el-select v-model="quizConfig.pointId" placeholder="请选择知识点">
              <el-option
                  v-for="point in store.knowledgePoints"
                  :key="point.id"
                  :label="point.name"
                  :value="point.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="题目数量">
            <el-input-number
                v-model="quizConfig.count"
                :min="1"
                :max="20"
                controls-position="right"
            />
          </el-form-item>
          <el-form-item label="难度级别">
            <el-select v-model="quizConfig.difficulty" placeholder="请选择难度">
              <el-option label="简单" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="困难" value="hard" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="startQuiz">
              开始测验
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-else class="quiz-content">
        <div v-if="currentQuestion" class="question-container">
          <div class="question-header">
            <h4>题目 {{ currentQuestionIndex + 1 }}/{{ currentQuiz.length }}</h4>
            <el-tag>分值: {{ currentQuestion.points }}</el-tag>
          </div>

          <div class="question-text">
            {{ currentQuestion.questionText }}
          </div>

          <div class="options-container">
            <el-radio-group v-model="currentAnswer">
              <div
                  v-for="option in currentQuestion.options"
                  :key="option.key"
                  class="option-item"
              >
                <el-radio :label="option.key" size="large">
                  <span class="option-key">{{ option.key }}.</span>
                  <span class="option-value">{{ option.value }}</span>
                </el-radio>
              </div>
            </el-radio-group>
          </div>

          <div class="quiz-actions">
            <el-button
                :disabled="currentQuestionIndex === 0"
                @click="prevQuestion"
            >
              上一题
            </el-button>
            <el-button
                v-if="currentQuestionIndex < currentQuiz.length - 1"
                type="primary"
                @click="nextQuestion"
            >
              下一题
            </el-button>
            <el-button
                v-else
                type="success"
                @click="submitQuiz"
            >
              提交答卷
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 测验结果 -->
    <el-card v-if="quizResult" class="mt-20">
      <template #header>
        <div class="result-header">
          <h3>测验结果</h3>
          <el-tag :type="getScoreType(quizResult.totalScore)">
            总分: {{ quizResult.totalScore }}
          </el-tag>
        </div>
      </template>

      <div class="result-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="result-stat">
              <h4>正确题数</h4>
              <p class="stat-value">{{ quizResult.correctCount }}/{{ quizResult.totalQuestions }}</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="result-stat">
              <h4>用时</h4>
              <p class="stat-value">{{ quizResult.timeSpent }}秒</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="result-stat">
              <h4>正确率</h4>
              <p class="stat-value">
                {{ ((quizResult.correctCount / quizResult.totalQuestions) * 100).toFixed(1) }}%
              </p>
            </div>
          </el-col>
        </el-row>

        <div class="recommendations mt-20">
          <h4>学习建议</h4>
          <p>{{ quizResult.recommendations.suggestedReview }}</p>
        </div>

        <div class="result-actions mt-20">
          <el-button type="primary" @click="restartQuiz">
            重新测验
          </el-button>
          <el-button @click="viewDetails">
            查看详情
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app'
import type { QuizQuestion } from '../types'

const store = useAppStore()

// 测验配置
const quizConfig = ref({
  pointId: '',
  count: 5,
  difficulty: 'medium'
})

// 测验状态
const quizStarted = ref(false)
const currentQuiz = ref<QuizQuestion[]>([])
const currentQuestionIndex = ref(0)
const currentAnswer = ref('')
const answers = ref<{ [key: number]: string }>({})
const timeLeft = ref(1800) // 30分钟
let timer: number | null = null

// 测验结果
const quizResult = ref<any>(null)

// 假数据 - 测验题目
const mockQuestions: QuizQuestion[] = [
  {
    questionId: 1,
    questionText: '在人机交互设计中，以下哪个原则最能提高用户的学习效率？',
    questionType: 'SINGLE_CHOICE',
    options: [
      { key: 'A', value: '一致性原则' },
      { key: 'B', value: '美观性原则' },
      { key: 'C', value: '复杂性原则' },
      { key: 'D', value: '随机性原则' }
    ],
    explanation: '一致性原则可以帮助用户快速学习界面操作，减少认知负担。',
    points: 2
  },
  {
    questionId: 2,
    questionText: '以下哪种交互设计模式最适合用于移动设备的导航？',
    questionType: 'SINGLE_CHOICE',
    options: [
      { key: 'A', value: '标签栏导航' },
      { key: 'B', value: '下拉菜单导航' },
      { key: 'C', value: '右键菜单导航' },
      { key: 'D', value: '命令行导航' }
    ],
    explanation: '标签栏导航在移动设备上具有较好的可用性和易操作性。',
    points: 2
  }
]

const currentQuestion = computed(() =>
    currentQuiz.value[currentQuestionIndex.value]
)

const answeredCount = computed(() =>
    Object.keys(answers.value).length
)

const startQuiz = () => {
  // 使用假数据
  currentQuiz.value = mockQuestions.slice(0, quizConfig.value.count)
  quizStarted.value = true
  currentQuestionIndex.value = 0
  answers.value = {}
  currentAnswer.value = ''

  // 启动计时器
  startTimer()
}

const startTimer = () => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      submitQuiz()
    }
  }, 1000)
}

const nextQuestion = () => {
  if (currentAnswer.value) {
    answers.value[currentQuestion.value.questionId] = currentAnswer.value
  }

  if (currentQuestionIndex.value < currentQuiz.value.length - 1) {
    currentQuestionIndex.value++
    currentAnswer.value = answers.value[currentQuestion.value.questionId] || ''
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    currentAnswer.value = answers.value[currentQuestion.value.questionId] || ''
  }
}

const submitQuiz = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  // 计算成绩（假数据）
  quizResult.value = {
    attemptId: 1,
    totalScore: 80.0,
    correctCount: 4,
    totalQuestions: 5,
    timeSpent: 1800 - timeLeft.value,
    recommendations: {
      suggestedReview: '建议重点复习用户界面设计原则和交互设计模式相关知识点。',
      weakPoints: ['用户界面设计原则', '交互设计模式']
    }
  }
}

const getScoreType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}

const restartQuiz = () => {
  quizStarted.value = false
  quizResult.value = null
  timeLeft.value = 1800
  currentAnswer.value = ''
}

const viewDetails = () => {
  ElMessage.info('查看详细解析')
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quiz-info {
  display: flex;
  gap: 10px;
}

.question-container {
  padding: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #303133;
}

.options-container {
  margin-bottom: 30px;
}

.option-item {
  margin: 15px 0;
  padding: 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.option-item:hover {
  background-color: #f5f7fa;
}

.option-key {
  font-weight: bold;
  margin-right: 8px;
}

.quiz-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #e6e6e6;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-stat {
  text-align: center;
  padding: 20px;
}

.result-stat h4 {
  margin: 0 0 10px 0;
  color: #606266;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #409eff;
}

.recommendations {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.recommendations h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.recommendations p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.result-actions {
  text-align: center;
}

.mt-20 {
  margin-top: 20px;
}
</style>
<template>
  <div class="quiz-view">
    <div class="page-header">
      <h1>智能测验</h1>
      <p>检验知识掌握程度，发现薄弱环节</p>
    </div>
    <QuizPanel />
  </div>
</template>

<script setup lang="ts">
import QuizPanel from '../components/QuizPanel.vue'
</script>

<style scoped>
.quiz-view {
  max-width: 1000px;
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
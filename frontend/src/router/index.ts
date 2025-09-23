import { createRouter, createWebHistory } from 'vue-router'
import CourseView from '@/views/CourseView.vue'
// import KnowledgeGraphView from '@/views/KnowledgeGraphView.vue'
// import QuizView from '@/views/QuizView.vue'

const routes = [
    { path: '/', redirect: '/courses' },
    { path: '/courses', component: CourseView },
    // { path: '/knowledge-graph', component: KnowledgeGraphView },
    // { path: '/quiz', component: QuizView }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
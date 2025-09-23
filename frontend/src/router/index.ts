import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import CourseView from '@/views/CourseView.vue'
import KnowledgeGraphView from '@/views/KnowledgeGraphView.vue'
import QuizView from '@/views/QuizView.vue'

const routes: RouteRecordRaw[] = [
    { path: '/', redirect: '/courses' },
    {
        path: '/courses',
        component: CourseView,
        meta: { title: '课程管理' }
    },
    {
        path: '/knowledge-graph',
        component: KnowledgeGraphView,
        meta: { title: '知识图谱' }
    },
    {
        path: '/quiz',
        component: QuizView,
        meta: { title: '智能测验' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫：更新页面标题
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = `${to.meta.title} - ReviewPilot`
    }
    next()
})

export default router
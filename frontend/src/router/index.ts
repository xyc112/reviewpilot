import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Courses from '../views/Courses.vue'
import KnowledgeGraphView from '../views/KnowledgeGraphView.vue'
import Quiz from '../views/Quiz.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Dashboard',
            component: Dashboard
        },
        {
            path: '/courses',
            name: 'Courses',
            component: Courses
        },
        {
            path: '/knowledge-graph',
            name: 'KnowledgeGraph',
            component: KnowledgeGraphView
        },
        {
            path: '/quiz',
            name: 'Quiz',
            component: Quiz
        }
    ]
})

export default router
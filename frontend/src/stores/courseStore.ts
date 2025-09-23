import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course, KnowledgeGraph, KnowledgePoint } from '@/types/api'
import { courseService, knowledgeGraphService, userService } from '@/services/api'

export const useCourseStore = defineStore('course', () => {
    const courses = ref<Course[]>([])
    const currentCourse = ref<Course | null>(null)
    const knowledgeGraph = ref<KnowledgeGraph | null>(null)
    const weakPoints = ref<KnowledgePoint[]>([])
    const loading = ref(false)

    const fetchCourses = async (): Promise<void> => {
        loading.value = true
        try {
            courses.value = await courseService.getCourses()
        } catch (error) {
            console.error('获取课程列表失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const fetchCourse = async (courseId: number): Promise<void> => {
        loading.value = true
        try {
            currentCourse.value = await courseService.getCourse(courseId)
        } catch (error) {
            console.error('获取课程详情失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const fetchKnowledgeGraph = async (courseId: number, userId: number = 1): Promise<void> => {
        loading.value = true
        try {
            knowledgeGraph.value = await knowledgeGraphService.getKnowledgeGraph({ courseId, userId })
        } catch (error) {
            console.error('获取知识图谱失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const fetchWeakPoints = async (courseId: number, userId: number = 1): Promise<void> => {
        try {
            weakPoints.value = await userService.getWeakPoints(courseId, userId)
        } catch (error) {
            console.error('获取薄弱知识点失败:', error)
            weakPoints.value = []
        }
    }

    const createCourse = async (courseData: Omit<Course, 'courseId'>): Promise<Course> => {
        try {
            const newCourse = await courseService.createCourse(courseData)
            courses.value.push(newCourse)
            return newCourse
        } catch (error) {
            console.error('创建课程失败:', error)
            throw error
        }
    }

    return {
        courses,
        currentCourse,
        knowledgeGraph,
        weakPoints,
        loading,
        fetchCourses,
        fetchCourse,
        fetchKnowledgeGraph,
        fetchWeakPoints,
        createCourse
    }
})
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course, KnowledgeGraph, KnowledgePoint } from '@/types/api'
import { courseService, knowledgeGraphService } from '@/services/api'

export const useCourseStore = defineStore('course', () => {
    const courses = ref<Course[]>([])
    const currentCourse = ref<Course | null>(null)
    const knowledgeGraph = ref<KnowledgeGraph | null>(null)
    const weakPoints = ref<KnowledgePoint[]>([])

    const fetchCourses = async () => {
        courses.value = await courseService.getCourses()
    }

    const fetchCourse = async (courseId: number) => {
        currentCourse.value = await courseService.getCourse(courseId)
    }

    const fetchKnowledgeGraph = async (courseId: number, userId: number = 1) => {
        knowledgeGraph.value = await knowledgeGraphService.getKnowledgeGraph(courseId, userId)
    }

    const fetchWeakPoints = async (courseId: number, userId: number = 1) => {
        // 这里需要调用userService.getWeakPoints，稍后补充
    }

    const createCourse = async (courseId: number, userId: number = 1) => {
        //
    }

    return {
        courses,
        currentCourse,
        knowledgeGraph,
        weakPoints,
        fetchCourses,
        fetchCourse,
        fetchKnowledgeGraph,
        fetchWeakPoints
    }
})
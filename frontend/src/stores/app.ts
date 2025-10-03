import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Course, KnowledgePoint, UserNote } from '../types'

export const useAppStore = defineStore('app', () => {
    const currentUser = ref({
        userId: 1,
        username: 'student01',
        realName: '张三'
    })

    const selectedCourse = ref<Course | null>(null)
    const selectedKnowledgePoint = ref<KnowledgePoint | null>(null)

    // 假数据
    const courses = ref<Course[]>([
        {
            courseId: 1,
            courseName: '人机交互',
            syllabus: '本课程介绍人机交互的基本原理、设计方法和评估技术...',
            credit: 3,
            teacher: '王教授',
            semester: '2024-秋季'
        },
        {
            courseId: 2,
            courseName: '软件工程',
            syllabus: '软件工程原理与实践...',
            credit: 4,
            teacher: '李教授',
            semester: '2024-秋季'
        }
    ])

    const knowledgePoints = ref<KnowledgePoint[]>([
        {
            id: '1',
            name: '用户界面设计原则',
            type: 'knowledgePoint',
            description: '学习用户界面设计的基本原则和准则',
            masteryLevel: 'weak',
            masteryScore: 65.5,
            questionCount: 15
        },
        {
            id: '2',
            name: '交互设计模式',
            type: 'knowledgePoint',
            description: '掌握常见的交互设计模式和应用场景',
            masteryLevel: 'medium',
            masteryScore: 78.0,
            questionCount: 12
        }
    ])

    const userNotes = ref<UserNote[]>([
        {
            noteId: 1,
            content: '用户界面设计需要遵循一致性、简洁性、可用性等原则...',
            attachments: [
                {
                    id: 1,
                    fileName: '设计原则总结.pdf',
                    fileUrl: '/attachments/1.pdf',
                    fileSize: 1024000
                }
            ],
            lastModified: '2024-01-15T10:30:00.000+00:00'
        }
    ])

    const selectCourse = (course: Course) => {
        selectedCourse.value = course
    }

    const selectKnowledgePoint = (point: KnowledgePoint) => {
        selectedKnowledgePoint.value = point
    }

    return {
        currentUser,
        courses,
        knowledgePoints,
        userNotes,
        selectedCourse,
        selectedKnowledgePoint,
        selectCourse,
        selectKnowledgePoint
    }
})
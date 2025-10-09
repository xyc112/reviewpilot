export const APP_CONFIG = {
    APP_NAME: 'ReviewPilot',
    VERSION: '1.0.0',
    API_TIMEOUT: 10000,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    PAGE_SIZE: 10,
} as const

export const ROUTES = {
    HOME: '/',
    KNOWLEDGE_GRAPH: '/knowledge-graph',
    DIAGNOSIS: '/diagnosis',
    NOTES: '/notes',
    QUIZ: '/quiz',
    ANALYTICS: '/analytics',
} as const

export const MASTERY_LEVELS = {
    weak: { color: '#ff4d4f', label: '薄弱' },
    medium: { color: '#faad14', label: '一般' },
    strong: { color: '#52c41a', label: '掌握' },
} as const

export const DIFFICULTY_LEVELS = {
    EASY: { color: '#52c41a', label: '简单' },
    MEDIUM: { color: '#faad14', label: '中等' },
    HARD: { color: '#ff4d4f', label: '困难' },
} as const
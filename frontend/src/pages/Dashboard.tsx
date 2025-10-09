import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Progress, List, Typography } from 'antd'
import {
    BookOutlined,
    CheckCircleOutlined,
    StarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons'
import { css } from '@emotion/react'
import { useAppStore } from '@/store/appStore'
import { LearningProgress, KnowledgePoint } from '@/types/api'
// import { analyticsAPI, userAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner'
// import EmptyState from '@/components/common/EmptyState'

const { Title, Text } = Typography

const dashboardStyles = {
    container: css`
    padding: 24px;
  `,
    section: css`
    margin-bottom: 24px;
  `,
    card: css`
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `,
    progressSection: css`
    margin-top: 16px;
  `,
    activityItem: css`
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
  `
}

const Dashboard: React.FC = () => {
    const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null)
    const [weakPoints, setWeakPoints] = useState<KnowledgePoint[]>([])
    const [/*stats*/, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { currentCourse } = useAppStore()

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            try {
                // 模拟数据 - 实际项目中从API获取
                const mockProgress: LearningProgress = {
                    totalPoints: 50,
                    completedPoints: 30,
                    masteredPoints: 20,
                    progressPercentage: 60.0,
                    estimatedCompletionTime: "2周",
                    recentActivity: [
                        { date: "2024-01-15", studyTime: 120, completedPoints: 3 },
                        { date: "2024-01-14", studyTime: 90, completedPoints: 2 },
                        { date: "2024-01-13", studyTime: 150, completedPoints: 4 }
                    ]
                }

                const mockWeakPoints: KnowledgePoint[] = [
                    {
                        id: '1',
                        name: '面向对象编程',
                        type: 'knowledgePoint',
                        description: '面向对象的基本概念',
                        masteryLevel: 'weak',
                        masteryScore: 45,
                        questionCount: 15,
                        difficulty: 'MEDIUM',
                        estimatedStudyTime: 120
                    },
                    {
                        id: '2',
                        name: '设计模式',
                        type: 'knowledgePoint',
                        description: '常见设计模式应用',
                        masteryLevel: 'weak',
                        masteryScore: 38,
                        questionCount: 10,
                        difficulty: 'HARD',
                        estimatedStudyTime: 180
                    }
                ]

                const mockStats = {
                    studyTime: {
                        totalMinutes: 1250,
                        dailyAverage: 89,
                        trend: 'increasing',
                        weeklyDistribution: [120, 90, 150, 80, 130, 60, 100]
                    },
                    quizPerformance: {
                        averageScore: 78.5,
                        completionRate: 85.2,
                        improvement: 12.3
                    }
                }

                setLearningProgress(mockProgress)
                setWeakPoints(mockWeakPoints)
                setStats(mockStats)
            } catch (error) {
                console.error('获取仪表盘数据失败:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [currentCourse])

    if (loading) {
        return <LoadingSpinner tip="加载学习数据..." />
    }

    return (
        <div css={dashboardStyles.container}>
            <Title level={2}>学习概览</Title>

            {/* 学习统计卡片 */}
            <Row gutter={[16, 16]} css={dashboardStyles.section}>
                <Col xs={24} sm={12} lg={6}>
                    <Card css={dashboardStyles.card}>
                        <Statistic
                            title="总知识点"
                            value={learningProgress?.totalPoints || 0}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card css={dashboardStyles.card}>
                        <Statistic
                            title="已掌握"
                            value={learningProgress?.masteredPoints || 0}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card css={dashboardStyles.card}>
                        <Statistic
                            title="学习进度"
                            value={learningProgress?.progressPercentage || 0}
                            suffix="%"
                            prefix={<StarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card css={dashboardStyles.card}>
                        <Statistic
                            title="预计完成时间"
                            value={learningProgress?.estimatedCompletionTime || '未知'}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* 学习进度 */}
                <Col xs={24} lg={12}>
                    <Card
                        title="学习进度"
                        css={dashboardStyles.card}
                    >
                        <div css={dashboardStyles.progressSection}>
                            <Progress
                                percent={learningProgress?.progressPercentage}
                                status="active"
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                            />
                            <Row justify="space-between" style={{ marginTop: 8 }}>
                                <Text type="secondary">已完成: {learningProgress?.completedPoints}/{learningProgress?.totalPoints}</Text>
                                <Text type="secondary">掌握: {learningProgress?.masteredPoints}</Text>
                            </Row>
                        </div>
                    </Card>
                </Col>

                {/* 薄弱知识点 */}
                <Col xs={24} lg={12}>
                    <Card
                        title="薄弱知识点"
                        css={dashboardStyles.card}
                    >
                        <List
                            dataSource={weakPoints}
                            renderItem={(point) => (
                                <List.Item css={dashboardStyles.activityItem}>
                                    <List.Item.Meta
                                        title={point.name}
                                        description={
                                            <div>
                                                <Text type="secondary">掌握度: {point.masteryScore}%</Text>
                                                <Progress
                                                    percent={point.masteryScore}
                                                    size="small"
                                                    status="exception"
                                                    style={{ marginTop: 4 }}
                                                />
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: '暂无薄弱知识点' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 最近活动 */}
            <Row gutter={[16, 16]} css={dashboardStyles.section}>
                <Col xs={24}>
                    <Card title="最近学习活动" css={dashboardStyles.card}>
                        <List
                            dataSource={learningProgress?.recentActivity}
                            renderItem={(activity) => (
                                <List.Item css={dashboardStyles.activityItem}>
                                    <List.Item.Meta
                                        title={activity.date}
                                        description={
                                            <div>
                                                <Text>学习时间: {activity.studyTime} 分钟</Text>
                                                <br />
                                                <Text>完成知识点: {activity.completedPoints} 个</Text>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: '暂无学习活动' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Dashboard
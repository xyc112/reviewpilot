import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Select, Button, Typography, Tag } from 'antd'
import { ReloadOutlined, FullscreenOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { css } from '@emotion/react'
import { useAppStore } from '@/store/appStore'
import { KnowledgeGraphData } from '@/types/api'
import { knowledgeGraphAPI } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { MASTERY_LEVELS, DIFFICULTY_LEVELS } from '@/utils/constants'

const { Title } = Typography
const { Option } = Select

const graphStyles = {
    container: css`
    padding: 24px;
  `,
    controls: css`
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  `,
    graphCard: css`
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 600px;
  `,
    legend: css`
    display: flex;
    gap: 16px;
    margin-top: 16px;
    flex-wrap: wrap;
  `
}

const KnowledgeGraph: React.FC = () => {
    const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedCourse, setSelectedCourse] = useState<number>(1)
    const { courses } = useAppStore()

    useEffect(() => {
        fetchKnowledgeGraph()
    }, [selectedCourse])

    const fetchKnowledgeGraph = async () => {
        setLoading(true)
        try {
            // 模拟知识图谱数据
            const mockGraphData: KnowledgeGraphData = {
                nodes: [
                    {
                        id: '1',
                        name: '面向对象基础',
                        type: 'knowledgePoint',
                        description: '面向对象编程的基本概念',
                        masteryLevel: 'strong',
                        masteryScore: 85,
                        questionCount: 20,
                        difficulty: 'EASY',
                        estimatedStudyTime: 120
                    },
                    {
                        id: '2',
                        name: '继承与多态',
                        type: 'knowledgePoint',
                        description: '面向对象的继承和多态特性',
                        masteryLevel: 'medium',
                        masteryScore: 65,
                        questionCount: 15,
                        difficulty: 'MEDIUM',
                        estimatedStudyTime: 180
                    },
                    {
                        id: '3',
                        name: '设计模式',
                        type: 'knowledgePoint',
                        description: '常见设计模式的应用',
                        masteryLevel: 'weak',
                        masteryScore: 45,
                        questionCount: 25,
                        difficulty: 'HARD',
                        estimatedStudyTime: 240
                    }
                ],
                edges: [
                    {
                        id: '1-2',
                        source: '1',
                        target: '2',
                        type: 'PREREQUISITE',
                        strength: 'strong'
                    },
                    {
                        id: '2-3',
                        source: '2',
                        target: '3',
                        type: 'PREREQUISITE',
                        strength: 'medium'
                    }
                ]
            }
            setGraphData(mockGraphData)
        } catch (error) {
            console.error('获取知识图谱失败:', error)
        } finally {
            setLoading(false)
        }
    }

    const getGraphOption = () => {
        if (!graphData) return {}

        const nodes = graphData.nodes.map(node => ({
            id: node.id,
            name: node.name,
            category: node.masteryLevel,
            symbolSize: 50,
            itemStyle: {
                color: MASTERY_LEVELS[node.masteryLevel].color
            },
            label: {
                show: true,
                formatter: '{b}',
                fontSize: 12
            },
            tooltip: {
                formatter: ({ data }: any) => `
          <div>
            <strong>${data.name}</strong><br/>
            掌握度: ${data.masteryScore}%<br/>
            难度: ${DIFFICULTY_LEVELS[data.difficulty].label}<br/>
            题目数: ${data.questionCount}<br/>
            预估学习: ${data.estimatedStudyTime}分钟
          </div>
        `
            }
        }))

        const edges = graphData.edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            lineStyle: {
                color: '#ccc',
                width: edge.strength === 'strong' ? 3 : edge.strength === 'medium' ? 2 : 1,
                type: edge.type === 'PREREQUISITE' ? 'solid' : 'dashed'
            },
            label: {
                show: true,
                formatter: edge.type
            }
        }))

        return {
            tooltip: {},
            legend: {
                data: ['薄弱', '一般', '掌握']
            },
            animation: true,
            series: [{
                type: 'graph',
                layout: 'force',
                data: nodes,
                links: edges,
                roam: true,
                label: {
                    position: 'right',
                    formatter: '{b}'
                },
                lineStyle: {
                    color: 'source',
                    curveness: 0.3
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 3
                    }
                },
                force: {
                    repulsion: 1000,
                    gravity: 0.1,
                    edgeLength: 200
                }
            }]
        }
    }

    return (
        <div css={graphStyles.container}>
            <div css={graphStyles.controls}>
                <Title level={2} style={{ margin: 0 }}>知识图谱</Title>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Select
                        value={selectedCourse}
                        onChange={setSelectedCourse}
                        style={{ width: 200 }}
                    >
                        {courses.map(course => (
                            <Option key={course.courseId} value={course.courseId}>
                                {course.courseName}
                            </Option>
                        ))}
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={fetchKnowledgeGraph}>
                        刷新
                    </Button>
                    <Button icon={<FullscreenOutlined />}>
                        全屏
                    </Button>
                </div>
            </div>

            <Card css={graphStyles.graphCard}>
                {loading ? (
                    <LoadingSpinner tip="加载知识图谱..." />
                ) : (
                    <>
                        <ReactECharts
                            option={getGraphOption()}
                            style={{ height: 500 }}
                            opts={{ renderer: 'canvas' }}
                        />
                        <div css={graphStyles.legend}>
                            <div>
                                <strong>掌握程度: </strong>
                                {Object.entries(MASTERY_LEVELS).map(([key, value]) => (
                                    <Tag key={key} color={value.color} style={{ marginRight: 8 }}>
                                        {value.label}
                                    </Tag>
                                ))}
                            </div>
                            <div>
                                <strong>关系类型: </strong>
                                <Tag style={{ marginRight: 8 }}>前置依赖</Tag>
                                <Tag style={{ marginRight: 8 }}>包含关系</Tag>
                                <Tag>相关关系</Tag>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    )
}

export default KnowledgeGraph
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Progress, List, Typography, Tag, Button } from "antd";
import { WarningOutlined, RocketOutlined } from "@ant-design/icons";
import { css } from "@emotion/react";
import { useAppStore } from "@/stores/appStore";
import { KnowledgePoint } from "@/types/api";
// import { userAPI } from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner.tsx";
import { MASTERY_LEVELS, DIFFICULTY_LEVELS } from "@/utils/constants";

const { Title, Text } = Typography;

const diagnosisStyles = {
  container: css`
    padding: 24px;
  `,
  section: css`
    margin-bottom: 24px;
  `,
  card: css`
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `,
  weakPointItem: css`
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
  `,
  improvementPlan: css`
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 6px;
    padding: 16px;
    margin-top: 16px;
  `,
};

const LearningDiagnosis: React.FC = () => {
  const [weakPoints, setWeakPoints] = useState<KnowledgePoint[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currentCourse } = useAppStore();

  useEffect(() => {
    fetchDiagnosisData();
  }, [currentCourse]);

  const fetchDiagnosisData = async () => {
    setLoading(true);
    try {
      // 模拟诊断数据
      const mockWeakPoints: KnowledgePoint[] = [
        {
          id: "1",
          name: "面向对象编程",
          type: "knowledgePoint",
          description: "面向对象的基本概念和原则",
          masteryLevel: "weak",
          masteryScore: 45,
          questionCount: 15,
          difficulty: "MEDIUM",
          estimatedStudyTime: 120,
        },
        {
          id: "2",
          name: "设计模式",
          type: "knowledgePoint",
          description: "常见设计模式的应用场景",
          masteryLevel: "weak",
          masteryScore: 38,
          questionCount: 10,
          difficulty: "HARD",
          estimatedStudyTime: 180,
        },
        {
          id: "3",
          name: "算法复杂度",
          type: "knowledgePoint",
          description: "时间复杂度和空间复杂度分析",
          masteryLevel: "weak",
          masteryScore: 42,
          questionCount: 12,
          difficulty: "HARD",
          estimatedStudyTime: 150,
        },
      ];

      const mockDiagnosisResult = {
        overallScore: 65,
        improvementAreas: ["面向对象编程", "设计模式", "算法复杂度"],
        recommendedStudyTime: "15小时",
        priorityOrder: ["设计模式", "算法复杂度", "面向对象编程"],
        suggestions: [
          "重点复习设计模式的应用场景和实现原理",
          "加强算法复杂度的计算和分析能力",
          "通过实际编程练习巩固面向对象概念",
        ],
      };

      setWeakPoints(mockWeakPoints);
      setDiagnosisResult(mockDiagnosisResult);
    } catch (error) {
      console.error("获取诊断数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner tip="生成学习诊断报告..." />;
  }

  return (
    <div css={diagnosisStyles.container}>
      <Title level={2}>学习诊断</Title>

      {/* 总体诊断结果 */}
      <Row gutter={[16, 16]} css={diagnosisStyles.section}>
        <Col xs={24} lg={8}>
          <Card css={diagnosisStyles.card}>
            <div style={{ textAlign: "center" }}>
              <Title level={3} style={{ color: "#1890ff" }}>
                {diagnosisResult?.overallScore}分
              </Title>
              <Text type="secondary">综合掌握程度</Text>
              <Progress
                percent={diagnosisResult?.overallScore}
                status="active"
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                style={{ marginTop: 16 }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title={
              <>
                <WarningOutlined /> 诊断摘要
              </>
            }
            css={diagnosisStyles.card}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Text strong>待改进领域: </Text>
                <br />
                {diagnosisResult?.improvementAreas.map(
                  (area: string, index: number) => (
                    <Tag key={index} color="orange" style={{ marginTop: 4 }}>
                      {area}
                    </Tag>
                  ),
                )}
              </Col>
              <Col xs={12}>
                <Text strong>建议学习时间: </Text>
                <Text>{diagnosisResult?.recommendedStudyTime}</Text>
                <br />
                <Text strong>优先级顺序: </Text>
                <div style={{ marginTop: 4 }}>
                  {diagnosisResult?.priorityOrder.map(
                    (item: string, index: number) => (
                      <Text key={index} type="secondary">
                        {index + 1}. {item}
                        {index < diagnosisResult.priorityOrder.length - 1
                          ? " → "
                          : ""}
                      </Text>
                    ),
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 薄弱知识点详情 */}
      <Row gutter={[16, 16]} css={diagnosisStyles.section}>
        <Col xs={24}>
          <Card
            title="薄弱知识点分析"
            css={diagnosisStyles.card}
            extra={
              <Button type="primary" icon={<RocketOutlined />}>
                生成学习计划
              </Button>
            }
          >
            <List
              dataSource={weakPoints}
              renderItem={(point) => (
                <List.Item css={diagnosisStyles.weakPointItem}>
                  <List.Item.Meta
                    title={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text strong>{point.name}</Text>
                        <Tag color={MASTERY_LEVELS[point.masteryLevel].color}>
                          {MASTERY_LEVELS[point.masteryLevel].label}
                        </Tag>
                        <Tag color={DIFFICULTY_LEVELS[point.difficulty].color}>
                          {DIFFICULTY_LEVELS[point.difficulty].label}
                        </Tag>
                      </div>
                    }
                    description={point.description}
                  />
                  <div style={{ textAlign: "right", minWidth: 200 }}>
                    <Progress
                      percent={point.masteryScore}
                      status="exception"
                      size="small"
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      掌握度: {point.masteryScore}%
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      建议学习: {point.estimatedStudyTime}分钟
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 改进建议 */}
      {diagnosisResult?.suggestions && (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="个性化改进建议" css={diagnosisStyles.card}>
              <div css={diagnosisStyles.improvementPlan}>
                <List
                  dataSource={diagnosisResult.suggestions}
                  renderItem={(suggestion: string, index: number) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Text type="success">{index + 1}.</Text>}
                        description={suggestion}
                      />
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default LearningDiagnosis;

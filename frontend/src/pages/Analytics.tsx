import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Select,
  DatePicker,
} from "antd";
import {
  ClockCircleOutlined,
  RiseOutlined,
  TrophyOutlined,
  BookOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { css } from "@emotion/react";
import { useAppStore } from "@/stores/appStore";
// import { analyticsAPI } from "@/services/api";
import LoadingSpinner from "@/components/LoadingSpinner.tsx";
import { MASTERY_LEVELS } from "@/utils/constants";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const analyticsStyles = {
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
  chartContainer: css`
    height: 300px;
  `,
  statsGrid: css`
    .ant-card {
      text-align: center;
    }
  `,
};

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [loading, setLoading] = useState(true);
  const { currentCourse } = useAppStore();

  useEffect(() => {
    fetchAnalyticsData();
  }, [currentCourse, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 模拟分析数据
      const mockStats = {
        studyTime: {
          totalMinutes: 1250,
          dailyAverage: 89,
          trend: "increasing",
          weeklyDistribution: [120, 90, 150, 80, 130, 60, 100],
        },
        quizPerformance: {
          averageScore: 78.5,
          completionRate: 85.2,
          improvement: 12.3,
          accuracyByType: {
            SINGLE_CHOICE: 82.1,
            MULTIPLE_CHOICE: 75.3,
            TRUE_FALSE: 88.5,
          },
        },
        knowledgeMastery: {
          mastered: 15,
          learning: 20,
          weak: 5,
          distribution: [15, 20, 5],
        },
        activityTrend: [
          { date: "01-15", studyTime: 120, quizzes: 3 },
          { date: "01-16", studyTime: 90, quizzes: 2 },
          { date: "01-17", studyTime: 150, quizzes: 4 },
          { date: "01-18", studyTime: 80, quizzes: 1 },
          { date: "01-19", studyTime: 130, quizzes: 3 },
          { date: "01-20", studyTime: 60, quizzes: 2 },
          { date: "01-21", studyTime: 100, quizzes: 3 },
        ],
      };
      setStats(mockStats);
    } catch (error) {
      console.error("获取分析数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStudyTimeOption = () => {
    return {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["学习时间", "测验次数"],
      },
      xAxis: {
        type: "category",
        data: stats?.activityTrend.map((item: any) => item.date) || [],
      },
      yAxis: [
        {
          type: "value",
          name: "学习时间(分钟)",
          position: "left",
        },
        {
          type: "value",
          name: "测验次数",
          position: "right",
        },
      ],
      series: [
        {
          name: "学习时间",
          type: "bar",
          data: stats?.activityTrend.map((item: any) => item.studyTime) || [],
          itemStyle: {
            color: "#1890ff",
          },
        },
        {
          name: "测验次数",
          type: "line",
          yAxisIndex: 1,
          data: stats?.activityTrend.map((item: any) => item.quizzes) || [],
          itemStyle: {
            color: "#52c41a",
          },
        },
      ],
    };
  };

  const getMasteryOption = () => {
    return {
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "掌握程度",
          type: "pie",
          radius: "50%",
          data: [
            {
              value: stats?.knowledgeMastery.mastered,
              name: "掌握",
              itemStyle: { color: MASTERY_LEVELS.strong.color },
            },
            {
              value: stats?.knowledgeMastery.learning,
              name: "学习中",
              itemStyle: { color: MASTERY_LEVELS.medium.color },
            },
            {
              value: stats?.knowledgeMastery.weak,
              name: "薄弱",
              itemStyle: { color: MASTERY_LEVELS.weak.color },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  };

  const getAccuracyOption = () => {
    return {
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        data: ["单选题", "多选题", "判断题"],
      },
      yAxis: {
        type: "value",
        name: "正确率(%)",
        max: 100,
      },
      series: [
        {
          name: "正确率",
          type: "bar",
          data: [
            stats?.quizPerformance.accuracyByType.SINGLE_CHOICE,
            stats?.quizPerformance.accuracyByType.MULTIPLE_CHOICE,
            stats?.quizPerformance.accuracyByType.TRUE_FALSE,
          ],
          itemStyle: {
            color: function (params: any) {
              const colors = ["#52c41a", "#faad14", "#1890ff"];
              return colors[params.dataIndex];
            },
          },
        },
      ],
    };
  };

  if (loading) {
    return <LoadingSpinner tip="加载学习分析..." />;
  }

  return (
    <div css={analyticsStyles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>学习分析</Title>
        <div style={{ display: "flex", gap: 8 }}>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Option value="week">最近一周</Option>
            <Option value="month">最近一月</Option>
            <Option value="year">最近一年</Option>
          </Select>
          <RangePicker />
        </div>
      </div>

      {/* 关键指标 */}
      <Row
        gutter={[16, 16]}
        css={[analyticsStyles.section, analyticsStyles.statsGrid]}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card css={analyticsStyles.card}>
            <Statistic
              title="总学习时间"
              value={stats?.studyTime.totalMinutes}
              suffix="分钟"
              prefix={<ClockCircleOutlined />}
            />
            <Text type="secondary">
              日均 {stats?.studyTime.dailyAverage} 分钟
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card css={analyticsStyles.card}>
            <Statistic
              title="平均测验分数"
              value={stats?.quizPerformance.averageScore}
              suffix="分"
              prefix={<TrophyOutlined />}
            />
            <Progress
              percent={stats?.quizPerformance.averageScore}
              size="small"
              status="active"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card css={analyticsStyles.card}>
            <Statistic
              title="进步幅度"
              value={stats?.quizPerformance.improvement}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <Text type="secondary">相比上月</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card css={analyticsStyles.card}>
            <Statistic
              title="知识点掌握"
              value={stats?.knowledgeMastery.mastered}
              suffix={`/ ${stats?.knowledgeMastery.mastered + stats?.knowledgeMastery.learning + stats?.knowledgeMastery.weak}`}
              prefix={<BookOutlined />}
            />
            <Text type="secondary">
              {Math.round(
                (stats?.knowledgeMastery.mastered /
                  (stats?.knowledgeMastery.mastered +
                    stats?.knowledgeMastery.learning +
                    stats?.knowledgeMastery.weak)) *
                  100,
              )}
              % 已掌握
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 图表分析 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="学习活动趋势" css={analyticsStyles.card}>
            <div css={analyticsStyles.chartContainer}>
              <ReactECharts option={getStudyTimeOption()} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="知识点掌握分布" css={analyticsStyles.card}>
            <div css={analyticsStyles.chartContainer}>
              <ReactECharts option={getMasteryOption()} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} css={analyticsStyles.section}>
        <Col xs={24}>
          <Card title="题目类型正确率分析" css={analyticsStyles.card}>
            <div css={analyticsStyles.chartContainer}>
              <ReactECharts option={getAccuracyOption()} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 学习建议 */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="个性化学习建议" css={analyticsStyles.card}>
            <div
              style={{
                padding: 16,
                background: "#f6ffed",
                borderRadius: 6,
                border: "1px solid #b7eb8f",
              }}
            >
              <Text strong>基于你的学习数据，我们建议：</Text>
              <ul style={{ marginTop: 8, marginBottom: 0 }}>
                <li>继续保持每日学习习惯，建议将学习时间集中在晚上7-9点</li>
                <li>多选题正确率相对较低，建议重点复习相关知识点</li>
                <li>薄弱知识点主要集中在设计模式部分，建议安排专项练习</li>
                <li>测验完成率良好，可以适当增加测验频率巩固知识</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;

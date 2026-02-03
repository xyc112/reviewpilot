import { useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, FileText, Trophy } from "lucide-react";
import type { OverallStats, CourseProgress } from "@/shared/types";
import { progressAPI, courseAPI } from "@/shared/api";
import { useCourseStore } from "@/shared/stores";
import {
  SkeletonGrid,
  CircularProgressChart,
  ScoreDistributionChart,
} from "@/shared/components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ROUTES } from "@/shared/config/routes";

const ProgressPage = () => {
  const currentStudyingCourse = useCourseStore(
    (state) => state.currentStudyingCourse,
  );
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [courseProgressList, setCourseProgressList] = useState<
    CourseProgress[]
  >([]);
  const [courses, setCourses] = useState<
    Map<number, { title: string; level: string }>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentStudyingCourseId = currentStudyingCourse?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, progressRes, coursesRes] = await Promise.all([
          progressAPI.getOverallStats(),
          progressAPI.getAllCourseProgress(),
          courseAPI.getCourses(),
        ]);

        setOverallStats(statsRes.data);
        setCourseProgressList(progressRes.data);

        const coursesMap = new Map<number, { title: string; level: string }>();
        coursesRes.data.forEach(
          (course: { id: number; title: string; level: string }) => {
            coursesMap.set(course.id, {
              title: course.title,
              level: course.level,
            });
          },
        );
        setCourses(coursesMap);
      } catch (err: unknown) {
        setError(
          "获取学习进度失败: " +
            (err instanceof Error ? err.message : "未知错误"),
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [currentStudyingCourseId]);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "#78716c";
    if (score >= 90) return "#22c55e";
    if (score >= 80) return "#3b82f6";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const getLevelText = (level: string) => {
    const levels: Record<string, string> = {
      BEGINNER: "初级",
      INTERMEDIATE: "中级",
      ADVANCED: "高级",
    };
    return levels[level] ?? level;
  };

  if (loading) {
    return (
      <div style={{ width: "100%", height: "100vh", padding: "0.625rem" }}>
        <SkeletonGrid count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-8 my-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // 如果有当前学习课程，显示单课程详细视图
  if (currentStudyingCourse) {
    const currentProgress = courseProgressList.find(
      (p) => p.courseId === currentStudyingCourse.id,
    );

    // 如果找不到进度数据，使用默认值
    const progressData = currentProgress ?? {
      courseId: currentStudyingCourse.id,
      completedQuizzes: 0,
      totalQuizzes: 0,
      completionRate: 0,
      averageScore: null,
      noteCount: 0,
      quizProgressList: [],
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0.625rem",
          minHeight: "100vh",
        }}
      >
        {/* 顶部：标题 */}
        <Card className="mb-2.5 shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">当前学习课程进度</CardTitle>
            <p className="text-sm text-muted-foreground">
              显示您正在学习课程的详细进度
            </p>
          </CardHeader>
        </Card>

        {/* 主体内容：使用 Grid 布局 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "0.625rem",
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* 左侧：统计卡片 */}
          <div
            style={{
              gridColumn: "span 3",
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
              minHeight: 0,
            }}
          >
            <CompactStatCard
              icon={<CheckCircle className="size-[18px]" />}
              title="完成测验"
              value={`${String(progressData.completedQuizzes)}/${String(progressData.totalQuizzes)}`}
              subtitle={`完成率 ${String(progressData.completionRate)}%`}
              color="#22c55e"
            />
            <CompactStatCard
              icon={<Trophy className="size-[18px]" />}
              title="平均分数"
              value={
                progressData.averageScore !== null
                  ? progressData.averageScore.toString()
                  : "--"
              }
              subtitle={progressData.averageScore !== null ? "分" : "暂无数据"}
              color="#f59e0b"
            />
            <CompactStatCard
              icon={<FileText className="size-[18px]" />}
              title="笔记数量"
              value={progressData.noteCount.toString()}
              subtitle="篇笔记"
              color="#8b5cf6"
            />
          </div>

          {/* 中间：进度图表 */}
          <div
            style={{
              gridColumn: "span 6",
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
              minHeight: 0,
            }}
          >
            {/* 完成度圆形图 */}
            <Card className="shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">课程完成度</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CircularProgressChart
                    completed={progressData.completedQuizzes}
                    total={progressData.totalQuizzes}
                    size={110}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 分数分布图 */}
            {progressData.quizProgressList.length > 0 ? (
              <Card className="flex min-h-0 flex-1 flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">分数分布</CardTitle>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 flex-col">
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {progressData.quizProgressList.filter(
                      (qp) => qp.score !== null,
                    ).length > 0 ? (
                      <ScoreDistributionChart
                        scores={progressData.quizProgressList
                          .filter(
                            (qp): qp is typeof qp & { score: number } =>
                              qp.score !== null,
                          )
                          .map((qp) => ({ score: qp.score, count: 1 }))}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          color: "#78716c",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8125rem",
                            color: "#78716c",
                          }}
                        >
                          暂无分数数据
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex min-h-0 flex-1 items-center justify-center">
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">
                    暂无测验记录
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：测验列表 */}
          <div
            style={{
              gridColumn: "span 3",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {progressData.quizProgressList.length > 0 ? (
              <Card className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">测验成绩</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {progressData.quizProgressList.map((quizProgress) => (
                      <div
                        key={quizProgress.quizId}
                        style={{
                          padding: "0.625rem",
                          backgroundColor: "#fafaf9",
                          borderRadius: "0.5rem",
                          border: `2px solid ${getScoreColor(quizProgress.score)}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 500,
                            marginBottom: "0.25rem",
                            color: "#1c1917",
                          }}
                        >
                          测验 {quizProgress.quizId}
                        </div>
                        <div
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            color: getScoreColor(quizProgress.score),
                          }}
                        >
                          {quizProgress.score !== null
                            ? `${String(quizProgress.score)}分`
                            : "--"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex min-h-0 flex-1 items-center justify-center">
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">
                    暂无测验记录
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 没有当前学习课程时，显示整体学习列表视图
  return (
    <div className="flex min-h-screen flex-col p-2.5">
      {/* 顶部标题 */}
      <Card className="mb-2.5 shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">学习进度总览</CardTitle>
          <p className="text-sm text-muted-foreground">
            显示您在学习列表中所有课程的整体进度
          </p>
        </CardHeader>
      </Card>

      {/* 主体内容 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "0.625rem",
          flex: 1,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* 左侧：统计卡片 */}
        <div
          style={{
            gridColumn: "span 4",
            display: "grid",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "0.625rem",
            minHeight: 0,
          }}
        >
          {overallStats ? (
            <>
              <CompactStatCard
                icon={<BookOpen className="size-6" />}
                title="学习课程"
                value={overallStats.totalCourses.toString()}
                subtitle="门课程"
                color="#3b82f6"
                large
              />
              <CompactStatCard
                icon={<CheckCircle className="size-6" />}
                title="完成测验"
                value={`${String(overallStats.completedQuizzes)}/${String(overallStats.totalQuizzes)}`}
                subtitle={`完成率 ${String(overallStats.completionRate)}%`}
                color="#22c55e"
                large
              />
              <CompactStatCard
                icon={<Trophy className="size-6" />}
                title="平均分数"
                value={
                  overallStats.averageScore !== null
                    ? overallStats.averageScore.toString()
                    : "--"
                }
                subtitle={
                  overallStats.averageScore !== null ? "分" : "暂无数据"
                }
                color="#f59e0b"
                large
              />
              <CompactStatCard
                icon={<FileText className="size-6" />}
                title="笔记数量"
                value={overallStats.totalNotes.toString()}
                subtitle="篇笔记"
                color="#8b5cf6"
                large
              />
            </>
          ) : null}
        </div>

        {/* 中间：整体完成度圆形图 */}
        <div
          style={{
            gridColumn: "span 4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          {overallStats && overallStats.totalQuizzes > 0 ? (
            <Card className="w-full text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">整体完成度</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgressChart
                    completed={overallStats.completedQuizzes}
                    total={overallStats.totalQuizzes}
                    size={150}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full text-center">
              <CardContent className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">暂无学习记录</p>
                <Link to={ROUTES.COURSES}>
                  <Button size="sm">浏览课程</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：课程列表 */}
        <div
          style={{
            gridColumn: "span 4",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {courseProgressList.length > 0 ? (
            <Card className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">课程进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {courseProgressList.map((progress) => {
                    const courseInfo = courses.get(progress.courseId);
                    if (!courseInfo) return null;

                    return (
                      <CompactCourseCard
                        key={progress.courseId}
                        title={courseInfo.title}
                        level={courseInfo.level}
                        completed={progress.completedQuizzes}
                        total={progress.totalQuizzes}
                        completionRate={progress.completionRate}
                        averageScore={progress.averageScore}
                        getLevelText={getLevelText}
                        getScoreColor={getScoreColor}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex min-h-0 flex-1 items-center justify-center">
              <CardContent>
                <p className="text-center text-sm text-muted-foreground">
                  暂无课程进度
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// 紧凑的统计卡片组件
const CompactStatCard = ({
  icon,
  title,
  value,
  subtitle,
  color,
  large = false,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  large?: boolean;
}) => {
  return (
    <Card className="flex flex-col justify-between">
      <CardContent className="flex flex-col gap-1 pt-4">
        <div className="flex items-center gap-2">
          <div style={{ color }} className="flex items-center">
            {icon}
          </div>
          <span
            className={
              large
                ? "text-sm text-muted-foreground"
                : "text-xs text-muted-foreground"
            }
          >
            {title}
          </span>
        </div>
        <div>
          <span
            className="font-semibold"
            style={{
              fontSize: large ? "1.625rem" : "1.25rem",
              lineHeight: 1.2,
            }}
          >
            {value}
          </span>
          <div>
            <span className="mt-1 text-[0.625rem] text-muted-foreground">
              {subtitle}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 紧凑的课程卡片组件
const CompactCourseCard = ({
  title,
  level,
  completed,
  total,
  completionRate,
  averageScore,
  getLevelText,
  getScoreColor,
}: {
  title: string;
  level: string;
  completed: number;
  total: number;
  completionRate: number;
  averageScore: number | null;
  getLevelText: (level: string) => string;
  getScoreColor: (score: number | null) => string;
}) => {
  return (
    <div
      style={{
        padding: "0.75rem",
        backgroundColor: "#fafaf9",
        borderRadius: "0.5rem",
        border: "1px solid #e7e5e4",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#1c1917",
              marginBottom: "0.25rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "0.625rem",
              color: "#78716c",
            }}
          >
            {getLevelText(level)} · {completed}/{total} 完成
          </div>
        </div>
        {averageScore !== null && (
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: getScoreColor(averageScore),
              marginLeft: "0.5rem",
            }}
          >
            {averageScore}
          </div>
        )}
      </div>
      {/* 进度条 */}
      <div
        style={{
          width: "100%",
          height: "0.3125rem",
          backgroundColor: "#f5f5f4",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${String(Math.min(completionRate, 100))}%`,
            height: "100%",
            backgroundColor: getScoreColor(averageScore),
            borderRadius: "9999px",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
};

export default ProgressPage;

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
        setCourses(new Map(coursesMap));
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
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1000px] flex-1 overflow-auto px-4 py-4">
          <SkeletonGrid count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[1000px] flex-1 overflow-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // 有当前学习课程：单课程进度（单列可滚动，内容精简）
  if (currentStudyingCourse) {
    const currentProgress = courseProgressList.find(
      (p) => p.courseId === currentStudyingCourse.id,
    );
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
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-[800px] flex-1 overflow-auto px-4 py-4">
          <Card className="mb-4 shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">当前学习课程进度</CardTitle>
              <p className="text-sm text-muted-foreground">
                显示您正在学习课程的详细进度
              </p>
            </CardHeader>
          </Card>

          <div className="flex flex-col gap-4">
            {/* 统计行：三张小卡片 */}
            <div className="grid grid-cols-3 gap-3">
              <CompactStatCard
                icon={<CheckCircle className="size-4" />}
                title="完成测验"
                value={`${String(progressData.completedQuizzes)}/${String(progressData.totalQuizzes)}`}
                subtitle={`${String(progressData.completionRate)}%`}
                color="#22c55e"
              />
              <CompactStatCard
                icon={<Trophy className="size-4" />}
                title="平均分"
                value={
                  progressData.averageScore !== null
                    ? String(progressData.averageScore)
                    : "--"
                }
                subtitle="分"
                color="#f59e0b"
              />
              <CompactStatCard
                icon={<FileText className="size-4" />}
                title="笔记"
                value={String(progressData.noteCount)}
                subtitle="篇"
                color="#8b5cf6"
              />
            </div>

            {/* 完成度圆环 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">课程完成度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-2">
                  <CircularProgressChart
                    completed={progressData.completedQuizzes}
                    total={progressData.totalQuizzes}
                    size={120}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 分数分布（有数据时显示） */}
            {progressData.quizProgressList.length > 0 &&
            progressData.quizProgressList.some((qp) => qp.score !== null) ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">分数分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreDistributionChart
                    scores={progressData.quizProgressList
                      .filter(
                        (qp): qp is typeof qp & { score: number } =>
                          qp.score !== null,
                      )
                      .map((qp) => ({ score: qp.score, count: 1 }))}
                  />
                </CardContent>
              </Card>
            ) : null}

            {/* 测验成绩列表 */}
            {progressData.quizProgressList.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">测验成绩</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {progressData.quizProgressList.map((qp) => (
                      <div
                        key={qp.quizId}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                        style={{
                          borderColor: getScoreColor(qp.score),
                          backgroundColor: `${getScoreColor(qp.score)}12`,
                        }}
                      >
                        <span className="text-sm font-medium">
                          测验 {qp.quizId}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: getScoreColor(qp.score) }}
                        >
                          {qp.score !== null ? `${String(qp.score)} 分` : "--"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  暂无测验记录
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 无当前学习课程：总览（单列可滚动）
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[900px] flex-1 overflow-auto px-4 py-4">
        <Card className="mb-4 shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">学习进度总览</CardTitle>
            <p className="text-sm text-muted-foreground">
              显示您在学习列表中所有课程的整体进度
            </p>
          </CardHeader>
        </Card>

        <div className="flex flex-col gap-4">
          {/* 统计卡片：2x2 网格 */}
          {overallStats ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <CompactStatCard
                icon={<BookOpen className="size-5" />}
                title="学习课程"
                value={String(overallStats.totalCourses)}
                subtitle="门"
                color="#3b82f6"
                large
              />
              <CompactStatCard
                icon={<CheckCircle className="size-5" />}
                title="完成测验"
                value={`${String(overallStats.completedQuizzes)}/${String(overallStats.totalQuizzes)}`}
                subtitle={`${String(overallStats.completionRate)}%`}
                color="#22c55e"
                large
              />
              <CompactStatCard
                icon={<Trophy className="size-5" />}
                title="平均分数"
                value={
                  overallStats.averageScore !== null
                    ? String(overallStats.averageScore)
                    : "--"
                }
                subtitle="分"
                color="#f59e0b"
                large
              />
              <CompactStatCard
                icon={<FileText className="size-5" />}
                title="笔记数量"
                value={String(overallStats.totalNotes)}
                subtitle="篇"
                color="#8b5cf6"
                large
              />
            </div>
          ) : null}

          {/* 整体完成度 */}
          {overallStats && overallStats.totalQuizzes > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">整体完成度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-2">
                  <CircularProgressChart
                    completed={overallStats.completedQuizzes}
                    total={overallStats.totalQuizzes}
                    size={140}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8">
                <p className="text-sm text-muted-foreground">暂无学习记录</p>
                <Link to={ROUTES.COURSES}>
                  <Button size="sm">浏览课程</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 课程进度列表 */}
          {courseProgressList.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">课程进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
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
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                暂无课程进度
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

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
}) => (
  <Card>
    <CardContent className="flex flex-col gap-1 pt-4">
      <div className="flex items-center gap-2">
        <span style={{ color }}>{icon}</span>
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
      <div className="flex items-baseline gap-1">
        <span
          className="font-semibold"
          style={{ fontSize: large ? "1.5rem" : "1.125rem", lineHeight: 1.2 }}
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
    </CardContent>
  </Card>
);

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
}) => (
  <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">
        {getLevelText(level)} · {completed}/{total} 完成
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width]"
          style={{
            width: `${String(Math.min(completionRate, 100))}%`,
            backgroundColor: getScoreColor(averageScore),
          }}
        />
      </div>
      {averageScore !== null && (
        <span
          className="text-sm font-semibold"
          style={{ color: getScoreColor(averageScore) }}
        >
          {averageScore}
        </span>
      )}
    </div>
  </div>
);

export default ProgressPage;

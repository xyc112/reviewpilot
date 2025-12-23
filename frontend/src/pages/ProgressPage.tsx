import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OverallStats, CourseProgress } from '../types';
import { progressAPI, courseAPI } from '../services/api';
import { useCourse } from '../context/CourseContext';
import { BookOpen, CheckCircle2, FileText, Trophy, Target, Star } from 'lucide-react';
import { SkeletonGrid } from '../components/common/Skeleton';
import { CircularProgressChart, ScoreDistributionChart } from '../components/common/ProgressChart';
import '../styles/Course.css';
import '../styles/CourseUI.css';

const ProgressPage: React.FC = () => {
    const { currentStudyingCourse } = useCourse();
    const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
    const [courseProgressList, setCourseProgressList] = useState<CourseProgress[]>([]);
    const [courses, setCourses] = useState<Map<number, { title: string; level: string }>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                coursesRes.data.forEach((course: any) => {
                    coursesMap.set(course.id, {
                        title: course.title,
                        level: course.level,
                    });
                });
                setCourses(coursesMap);
            } catch (err: any) {
                setError('获取学习进度失败: ' + (err.response?.data?.message || '未知错误'));
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [currentStudyingCourseId]);

    const getScoreColor = (score: number | null) => {
        if (score === null) return '#78716c';
        if (score >= 90) return '#22c55e';
        if (score >= 80) return '#3b82f6';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getLevelText = (level: string) => {
        const levels: Record<string, string> = {
            'BEGINNER': '初级',
            'INTERMEDIATE': '中级',
            'ADVANCED': '高级',
        };
        return levels[level] || level;
    };

    if (loading) {
        return (
            <div className="container progress-container-fullscreen">
                <SkeletonGrid count={4} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container progress-container-fullscreen">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    // 如果有当前学习课程，显示单课程详细视图
    if (currentStudyingCourse) {
        const currentProgress = courseProgressList.find(p => p.courseId === currentStudyingCourse.id);
        const courseInfo = courses.get(currentStudyingCourse.id);
        
        // 如果找不到进度数据，使用默认值
        const progressData = currentProgress || {
            courseId: currentStudyingCourse.id,
            completedQuizzes: 0,
            totalQuizzes: 0,
            completionRate: 0,
            averageScore: null,
            noteCount: 0,
            quizProgressList: [],
        };

        return (
            <div className="container progress-container-fullscreen" style={{ 
                display: 'flex',
                flexDirection: 'column',
                padding: '0.625rem',
            }}>
                {/* 顶部：标题 */}
                <div style={{ marginBottom: '0.625rem', flexShrink: 0 }}>
                    <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>当前学习课程进度</h2>
                    <p style={{ margin: '0.125rem 0 0 0', color: '#78716c', fontSize: '0.8125rem' }}>
                        显示您正在学习课程的详细进度
                    </p>
                </div>

                {/* 主体内容：使用 Grid 布局 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: '0.625rem',
                    flex: 1,
                    overflow: 'hidden',
                    minHeight: 0,
                }}>
                    {/* 左侧：统计卡片 */}
                    <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '0.625rem', minHeight: 0 }}>
                        <CompactStatCard
                            icon={<CheckCircle2 size={18} />}
                            title="完成测验"
                            value={`${progressData.completedQuizzes}/${progressData.totalQuizzes}`}
                            subtitle={`完成率 ${progressData.completionRate}%`}
                            color="#22c55e"
                        />
                        <CompactStatCard
                            icon={<Trophy size={18} />}
                            title="平均分数"
                            value={progressData.averageScore !== null ? progressData.averageScore.toString() : '--'}
                            subtitle={progressData.averageScore !== null ? '分' : '暂无数据'}
                            color="#f59e0b"
                        />
                        <CompactStatCard
                            icon={<FileText size={18} />}
                            title="笔记数量"
                            value={progressData.noteCount.toString()}
                            subtitle="篇笔记"
                            color="#8b5cf6"
                        />
                    </div>

                    {/* 中间：进度图表 */}
                    <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', gap: '0.625rem', minHeight: 0 }}>
                        {/* 完成度圆形图 */}
                        <div className="content-section" style={{ flex: '0 0 auto', padding: '0.875rem' }}>
                            <h3 style={{ margin: '0 0 0.625rem 0', fontSize: '0.875rem', fontWeight: 600 }}>课程完成度</h3>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <CircularProgressChart
                                    completed={progressData.completedQuizzes}
                                    total={progressData.totalQuizzes}
                                    size={110}
                                />
                            </div>
                        </div>

                        {/* 分数分布图 */}
                        {progressData.quizProgressList.length > 0 ? (
                            <div className="content-section" style={{ flex: 1, padding: '0.875rem', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 0.625rem 0', fontSize: '0.875rem', fontWeight: 600 }}>分数分布</h3>
                                <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center' }}>
                                    {progressData.quizProgressList.filter(qp => qp.score !== null).length > 0 ? (
                                        <ScoreDistributionChart
                                            scores={progressData.quizProgressList
                                                .filter(qp => qp.score !== null)
                                                .map(qp => ({ score: qp.score!, count: 1 }))}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: '#78716c' }}>
                                            <p style={{ margin: 0, fontSize: '0.8125rem' }}>暂无分数数据</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="content-section" style={{ flex: 1, padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                                <div style={{ textAlign: 'center', color: '#78716c' }}>
                                    <Target size={28} style={{ margin: '0 auto 0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.8125rem' }}>暂无测验记录</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 右侧：测验列表 */}
                    <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        {progressData.quizProgressList.length > 0 ? (
                            <div className="content-section" style={{ flex: 1, padding: '0.875rem', overflowY: 'auto', minHeight: 0 }}>
                                <h3 style={{ margin: '0 0 0.625rem 0', fontSize: '0.875rem', fontWeight: 600 }}>测验成绩</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {progressData.quizProgressList.map((quizProgress) => (
                                        <div
                                            key={quizProgress.quizId}
                                            style={{
                                                padding: '0.625rem',
                                                backgroundColor: '#fafaf9',
                                                borderRadius: '0.5rem',
                                                border: `2px solid ${getScoreColor(quizProgress.score)}`,
                                            }}
                                        >
                                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                                测验 {quizProgress.quizId}
                                            </div>
                                            <div style={{ 
                                                fontSize: '1.125rem', 
                                                fontWeight: 700, 
                                                color: getScoreColor(quizProgress.score),
                                            }}>
                                                {quizProgress.score !== null ? `${quizProgress.score}分` : '--'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="content-section" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center', color: '#78716c' }}>
                                    <Target size={28} style={{ margin: '0 auto 0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.8125rem' }}>暂无测验记录</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 没有当前学习课程时，显示整体学习列表视图
    return (
        <div className="container progress-container-fullscreen" style={{ 
            display: 'flex',
            flexDirection: 'column',
            padding: '0.625rem',
        }}>
            {/* 顶部标题 */}
            <div style={{ marginBottom: '0.625rem', flexShrink: 0 }}>
                <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>学习进度总览</h2>
                <p style={{ margin: '0.125rem 0 0 0', color: '#78716c', fontSize: '0.8125rem' }}>
                    显示您在学习列表中所有课程的整体进度
                </p>
            </div>

            {/* 主体内容 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '0.625rem',
                flex: 1,
                overflow: 'hidden',
                minHeight: 0,
            }}>
                {/* 左侧：统计卡片 */}
                <div style={{ gridColumn: 'span 4', display: 'grid', gridTemplateRows: 'repeat(2, 1fr)', gap: '0.625rem', minHeight: 0 }}>
                    {overallStats && (
                        <>
                            <CompactStatCard
                                icon={<BookOpen size={24} />}
                                title="学习课程"
                                value={overallStats.totalCourses.toString()}
                                subtitle="门课程"
                                color="#3b82f6"
                                large
                            />
                            <CompactStatCard
                                icon={<CheckCircle2 size={24} />}
                                title="完成测验"
                                value={`${overallStats.completedQuizzes}/${overallStats.totalQuizzes}`}
                                subtitle={`完成率 ${overallStats.completionRate}%`}
                                color="#22c55e"
                                large
                            />
                            <CompactStatCard
                                icon={<Trophy size={24} />}
                                title="平均分数"
                                value={overallStats.averageScore !== null ? overallStats.averageScore.toString() : '--'}
                                subtitle={overallStats.averageScore !== null ? '分' : '暂无数据'}
                                color="#f59e0b"
                                large
                            />
                            <CompactStatCard
                                icon={<FileText size={24} />}
                                title="笔记数量"
                                value={overallStats.totalNotes.toString()}
                                subtitle="篇笔记"
                                color="#8b5cf6"
                                large
                            />
                        </>
                    )}
                </div>

                {/* 中间：整体完成度圆形图 */}
                <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                    {overallStats && overallStats.totalQuizzes > 0 ? (
                        <div className="content-section" style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
                            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem', fontWeight: 600 }}>整体完成度</h3>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <CircularProgressChart
                                    completed={overallStats.completedQuizzes}
                                    total={overallStats.totalQuizzes}
                                    size={150}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="content-section" style={{ padding: '1rem', textAlign: 'center', width: '100%' }}>
                            <Target size={36} style={{ margin: '0 auto 0.625rem', color: '#78716c' }} />
                            <p style={{ color: '#78716c', margin: '0 0 0.625rem 0', fontSize: '0.8125rem' }}>暂无学习记录</p>
                            <Link to="/courses" className="btn btn-primary btn-small">
                                浏览课程
                            </Link>
                        </div>
                    )}
                </div>

                {/* 右侧：课程列表 */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {courseProgressList.length > 0 ? (
                        <div className="content-section" style={{ flex: 1, padding: '0.875rem', overflowY: 'auto', minHeight: 0 }}>
                            <h3 style={{ margin: '0 0 0.625rem 0', fontSize: '0.875rem', fontWeight: 600 }}>课程进度</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                        </div>
                    ) : (
                        <div className="content-section" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ textAlign: 'center', color: '#78716c' }}>
                                <Target size={28} style={{ margin: '0 auto 0.5rem' }} />
                                <p style={{ margin: 0, fontSize: '0.8125rem' }}>暂无课程进度</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 紧凑的统计卡片组件
const CompactStatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: string;
    large?: boolean;
}> = ({ icon, title, value, subtitle, color, large = false }) => {
    return (
        <div className="content-section" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: large ? '0.875rem' : '0.75rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: large ? '0.625rem' : '0.5rem' }}>
                <div style={{ color, display: 'flex', alignItems: 'center' }}>
                    {icon}
                </div>
                <h3 style={{ margin: 0, fontSize: large ? '0.875rem' : '0.75rem', fontWeight: 500, color: '#78716c' }}>
                    {title}
                </h3>
            </div>
            <div>
                <div style={{ fontSize: large ? '1.625rem' : '1.25rem', fontWeight: 700, color: '#1c1917', lineHeight: 1.2 }}>
                    {value}
                </div>
                <div style={{ fontSize: '0.625rem', color: '#78716c', marginTop: '0.25rem' }}>
                    {subtitle}
                </div>
            </div>
        </div>
    );
};

// 紧凑的课程卡片组件
const CompactCourseCard: React.FC<{
    title: string;
    level: string;
    completed: number;
    total: number;
    completionRate: number;
    averageScore: number | null;
    getLevelText: (level: string) => string;
    getScoreColor: (score: number | null) => string;
}> = ({ title, level, completed, total, completionRate, averageScore, getLevelText, getScoreColor }) => {
    return (
        <div style={{
            padding: '0.75rem',
            backgroundColor: '#fafaf9',
            borderRadius: '0.5rem',
            border: '1px solid #e7e5e4',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1c1917', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {title}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#78716c' }}>
                        {getLevelText(level)} · {completed}/{total} 完成
                    </div>
                </div>
                {averageScore !== null && (
                    <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: getScoreColor(averageScore),
                        marginLeft: '0.5rem',
                    }}>
                        {averageScore}
                    </div>
                )}
            </div>
            {/* 进度条 */}
            <div style={{
                width: '100%',
                height: '0.3125rem',
                backgroundColor: '#f5f5f4',
                borderRadius: '9999px',
                overflow: 'hidden',
            }}>
                <div
                    style={{
                        width: `${Math.min(completionRate, 100)}%`,
                        height: '100%',
                        backgroundColor: getScoreColor(averageScore),
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease',
                    }}
                />
            </div>
        </div>
    );
};

export default ProgressPage;

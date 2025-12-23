import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OverallStats, CourseProgress } from '../types';
import { progressAPI, courseAPI } from '../services/api';
import { useCourse } from '../context/CourseContext';
import { BookOpen, CheckCircle2, FileText, Trophy, TrendingUp, Target } from 'lucide-react';
import { SkeletonGrid } from '../components/common/Skeleton';
import '../styles/Course.css';
import '../styles/CourseUI.css';

const ProgressPage: React.FC = () => {
    const { selectedCourse } = useCourse();
    const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
    const [courseProgressList, setCourseProgressList] = useState<CourseProgress[]>([]);
    const [courses, setCourses] = useState<Map<number, { title: string; level: string }>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

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

            // 创建课程信息映射
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return '#78716c';
        if (score >= 90) return '#22c55e'; // green
        if (score >= 80) return '#3b82f6'; // blue
        if (score >= 60) return '#f59e0b'; // amber
        return '#ef4444'; // red
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
            <div className="container">
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1>学习进度</h1>
                            <p className="text-stone-500 mt-2">查看您的学习成果和进度统计</p>
                        </div>
                    </div>
                </div>
                <SkeletonGrid count={4} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>学习进度</h1>
                        <p className="text-stone-500 mt-2">查看您的学习成果和进度统计</p>
                    </div>
                </div>
            </div>

            {/* 总体统计卡片 */}
            {overallStats && (
                <div className="stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem',
                }}>
                    <StatCard
                        icon={<BookOpen size={24} />}
                        title="学习课程"
                        value={overallStats.totalCourses.toString()}
                        subtitle="门课程"
                        color="#3b82f6"
                    />
                    <StatCard
                        icon={<CheckCircle2 size={24} />}
                        title="完成测验"
                        value={`${overallStats.completedQuizzes}/${overallStats.totalQuizzes}`}
                        subtitle={`完成率 ${overallStats.completionRate}%`}
                        color="#22c55e"
                    />
                    <StatCard
                        icon={<Trophy size={24} />}
                        title="平均分数"
                        value={overallStats.averageScore !== null ? overallStats.averageScore.toString() : '--'}
                        subtitle={overallStats.averageScore !== null ? '分' : '暂无数据'}
                        color="#f59e0b"
                    />
                    <StatCard
                        icon={<FileText size={24} />}
                        title="笔记数量"
                        value={overallStats.totalNotes.toString()}
                        subtitle="篇笔记"
                        color="#8b5cf6"
                    />
                </div>
            )}

            {/* 完成率进度条 */}
            {overallStats && overallStats.totalQuizzes > 0 && (
                <div className="content-section" style={{ marginBottom: '3rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>整体完成度</h2>
                        <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#3b82f6' }}>
                            {overallStats.completionRate}%
                        </span>
                    </div>
                    <ProgressBar
                        percentage={overallStats.completionRate}
                        color="#3b82f6"
                        height="1rem"
                    />
                    <div style={{ marginTop: '0.5rem', color: '#78716c', fontSize: '0.875rem' }}>
                        已完成 {overallStats.completedQuizzes} 个测验，共 {overallStats.totalQuizzes} 个测验
                    </div>
                </div>
            )}

            {/* 课程进度列表 */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>
                    课程进度详情
                </h2>
                {courseProgressList.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <Target size={48} strokeWidth={1} />
                        </div>
                        <h3>暂无学习记录</h3>
                        <p>开始学习课程并完成测验，这里将显示您的学习进度</p>
                        <Link to="/courses" className="btn btn-primary">
                            浏览课程
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {courseProgressList.map((progress) => {
                            const courseInfo = courses.get(progress.courseId);
                            if (!courseInfo) return null;

                            return (
                                <CourseProgressCard
                                    key={progress.courseId}
                                    progress={progress}
                                    courseTitle={courseInfo.title}
                                    courseLevel={courseInfo.level}
                                    getLevelText={getLevelText}
                                    getScoreColor={getScoreColor}
                                    formatDate={formatDate}
                                    selectedCourseId={selectedCourse?.id}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// 统计卡片组件
const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: string;
}> = ({ icon, title, value, subtitle, color }) => {
    return (
        <div className="content-section" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color, display: 'flex', alignItems: 'center' }}>
                    {icon}
                </div>
                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 500, color: '#78716c' }}>
                    {title}
                </h3>
            </div>
            <div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1c1917', lineHeight: 1.2 }}>
                    {value}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#78716c', marginTop: '0.25rem' }}>
                    {subtitle}
                </div>
            </div>
        </div>
    );
};

// 进度条组件
const ProgressBar: React.FC<{
    percentage: number;
    color: string;
    height?: string;
}> = ({ percentage, color, height = '0.5rem' }) => {
    return (
        <div style={{
            width: '100%',
            height,
            backgroundColor: '#f5f5f4',
            borderRadius: '9999px',
            overflow: 'hidden',
        }}>
            <div
                style={{
                    width: `${Math.min(percentage, 100)}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: '9999px',
                    transition: 'width 0.5s ease',
                }}
            />
        </div>
    );
};

// 课程进度卡片组件
const CourseProgressCard: React.FC<{
    progress: CourseProgress;
    courseTitle: string;
    courseLevel: string;
    getLevelText: (level: string) => string;
    getScoreColor: (score: number | null) => string;
    formatDate: (date: string) => string;
    selectedCourseId?: number;
}> = ({ progress, courseTitle, courseLevel, getLevelText, getScoreColor, formatDate, selectedCourseId }) => {
    const isSelected = selectedCourseId === progress.courseId;

    return (
        <div className="content-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1c1917' }}>
                            {courseTitle}
                        </h3>
                        <span className={`level-badge level-${courseLevel.toLowerCase()}`}>
                            {getLevelText(courseLevel)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', color: '#78716c', fontSize: '0.9375rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={16} />
                            <span>完成 {progress.completedQuizzes}/{progress.totalQuizzes} 个测验</span>
                        </div>
                        {progress.averageScore !== null && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trophy size={16} />
                                <span>平均分 {progress.averageScore} 分</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={16} />
                            <span>{progress.noteCount} 篇笔记</span>
                        </div>
                    </div>
                </div>
                {isSelected && (
                    <Link to={`/courses`} className="btn btn-secondary btn-small">
                        查看课程
                    </Link>
                )}
            </div>

            {/* 完成率进度条 */}
            {progress.totalQuizzes > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#57534e' }}>课程完成度</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3b82f6' }}>
                            {progress.completionRate}%
                        </span>
                    </div>
                    <ProgressBar
                        percentage={progress.completionRate}
                        color="#3b82f6"
                        height="0.75rem"
                    />
                </div>
            )}

            {/* 测验详情列表 */}
            {progress.quizProgressList.length > 0 && (
                <div>
                    <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: '#1c1917' }}>
                        测验成绩
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {progress.quizProgressList.map((quizProgress) => (
                            <div
                                key={quizProgress.quizId}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#fafaf9',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e7e5e4',
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#1c1917', marginBottom: '0.25rem' }}>
                                        测验 {quizProgress.quizId}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: '#78716c' }}>
                                        {formatDate(quizProgress.completedAt)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {quizProgress.score !== null && quizProgress.totalScore !== null && (
                                        <div style={{
                                            fontSize: '1.125rem',
                                            fontWeight: 700,
                                            color: getScoreColor(quizProgress.score),
                                        }}>
                                            {quizProgress.score}/{quizProgress.totalScore}
                                        </div>
                                    )}
                                    <div style={{
                                        width: '2.5rem',
                                        height: '2.5rem',
                                        borderRadius: '50%',
                                        backgroundColor: getScoreColor(quizProgress.score || 0),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                    }}>
                                        {quizProgress.score !== null ? quizProgress.score : '--'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressPage;


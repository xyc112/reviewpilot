import React, { useState, useEffect, useMemo } from 'react';
import { ReviewPlan as ReviewPlanType } from '../types';
import { reviewPlanAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { useTheme } from '../components/common/ThemeProvider';
import { Calendar, Plus, Edit, Trash2, Check, X, Clock, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import '../styles/CourseUI.css';

const ReviewPlanPage: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [plans, setPlans] = useState<ReviewPlanType[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<ReviewPlanType | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; planId: number | null }>({
        isOpen: false,
        planId: null,
    });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'plan' as 'plan' | 'exam',
        planDate: '',
    });
    const { success, error: showError } = useToast();

    useEffect(() => {
        fetchPlans();
    }, []);

    // 当计划加载完成后，如果还没有选中日期，则自动选中今天
    useEffect(() => {
        if (!loading && plans.length >= 0 && selectedDate === null) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setSelectedDate(today);
        }
    }, [loading, plans, selectedDate]);

    const fetchPlans = async () => {
        try {
            const response = await reviewPlanAPI.getPlans();
            setPlans(response.data);
        } catch (err: any) {
            showError('获取复习计划失败');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];
        // 填充前面的空位
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // 填充日期
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const formatDateLocal = (date: Date) => {
        // 使用本地时区格式化为 YYYY-MM-DD，避免 toISOString 带来的时区偏移导致显示前一天
        return date.toLocaleDateString('en-CA'); // en-CA 区分度低，直接返回 2025-12-23 格式
    };

    const getPlansForDate = (date: Date) => {
        const dateStr = formatDateLocal(date);
        return plans.filter(plan => plan.planDate === dateStr);
    };

    const hasPlansOnDate = (date: Date) => {
        return getPlansForDate(date).length > 0;
    };

    const getPlanCountOnDate = (date: Date) => {
        return getPlansForDate(date).length;
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        // 点击日期时只选中日期，不自动打开表单
        setShowPlanForm(false);
        setEditingPlan(null);
    };

    const handleStartNewPlan = () => {
        // 如果有选中的日期，使用选中日期，否则使用今天
        const dateToUse = selectedDate || new Date();
        const dateStr = formatDateLocal(dateToUse);
        setSelectedDate(dateToUse);
        setFormData({ title: '', description: '', type: 'plan', planDate: dateStr });
        setShowPlanForm(true);
        setEditingPlan(null);
    };

    const handleCreatePlan = async () => {
        if (!formData.title.trim() || !formData.planDate) {
            showError('请填写标题和日期');
            return;
        }

        try {
            await reviewPlanAPI.createPlan({
                title: formData.title,
                description: formData.description,
                type: formData.type,
                planDate: formData.planDate,
                completed: false,
            });
            success('复习计划创建成功');
            setShowPlanForm(false);
            setFormData({ title: '', description: '', type: 'plan', planDate: '' });
            // 如果创建的计划日期被选中，刷新选中日期的显示
            if (formData.planDate) {
                const planDate = new Date(formData.planDate);
                setSelectedDate(planDate);
            }
            await fetchPlans();
        } catch (err: any) {
            showError('创建复习计划失败: ' + (err.response?.data?.message || '未知错误'));
        }
    };

    const handleEditPlan = (plan: ReviewPlanType) => {
        setEditingPlan(plan);
        setFormData({
            title: plan.title,
            description: plan.description || '',
            type: plan.type,
            planDate: plan.planDate,
        });
        setShowPlanForm(true);
    };

    const handleUpdatePlan = async () => {
        if (!editingPlan || !formData.title.trim()) {
            showError('请填写标题');
            return;
        }

        try {
            await reviewPlanAPI.updatePlan(editingPlan.id, {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                planDate: formData.planDate,
            });
            success('复习计划更新成功');
            setShowPlanForm(false);
            setEditingPlan(null);
            setFormData({ title: '', description: '', type: 'plan', planDate: '' });
            // 刷新选中日期的显示
            if (selectedDate) {
                const dateStr = formatDateLocal(selectedDate);
                if (dateStr === formData.planDate || dateStr === editingPlan.planDate) {
                    // 如果更新后的日期仍然是选中日期，保持选中
                }
            }
            await fetchPlans();
        } catch (err: any) {
            showError('更新复习计划失败: ' + (err.response?.data?.message || '未知错误'));
        }
    };

    const handleDeletePlan = (planId: number) => {
        setDeleteConfirm({ isOpen: true, planId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.planId) return;
        try {
            await reviewPlanAPI.deletePlan(deleteConfirm.planId);
            success('复习计划删除成功');
            await fetchPlans();
        } catch (err: any) {
            showError('删除复习计划失败: ' + (err.response?.data?.message || '未知错误'));
        } finally {
            setDeleteConfirm({ isOpen: false, planId: null });
        }
    };

    const handleToggleComplete = async (plan: ReviewPlanType) => {
        try {
            await reviewPlanAPI.updatePlan(plan.id, { completed: !plan.completed });
            success(plan.completed ? '已标记为未完成' : '已标记为完成');
            await fetchPlans();
        } catch (err: any) {
            showError('更新状态失败: ' + (err.response?.data?.message || '未知错误'));
        }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const selectedDatePlans = useMemo(() => {
        if (!selectedDate) return [];
        return getPlansForDate(selectedDate);
    }, [selectedDate, plans]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingPlans = useMemo(() => {
        return plans
            .filter(plan => {
                const planDate = new Date(plan.planDate);
                planDate.setHours(0, 0, 0, 0);
                return planDate >= today && !plan.completed;
            })
            .sort((a, b) => a.planDate.localeCompare(b.planDate))
            .slice(0, 5);
    }, [plans]);

    const days = getDaysInMonth(currentDate);
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    if (loading) {
        return (
        <div className="container">
            <div style={{ textAlign: 'center', padding: '2rem', color: isDark ? '#f9fafb' : '#1c1917' }}>加载中...</div>
        </div>
    );
    }

    return (
        <div className="container">

            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="删除复习计划"
                message="确定要删除这个复习计划吗？此操作无法撤销。"
                confirmText="删除"
                cancelText="取消"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, planId: null })}
            />

            {/* 日历和计划列表 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', alignItems: 'start' }}>
                {/* 日历 */}
                <div className="content-section">
                    <div style={{ padding: '1rem' }}>
                        {/* 月份导航 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <button onClick={handlePrevMonth} className="btn btn-outline btn-small">
                                <ChevronLeft size={18} />
                            </button>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: isDark ? '#f9fafb' : '#1c1917' }}>
                                {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                            </h3>
                            <button onClick={handleNextMonth} className="btn btn-outline btn-small">
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* 星期标题 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {weekDays.map(day => (
                                <div key={day} style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: '#78716c', padding: '0.5rem' }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* 日期网格 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                            {days.map((date, index) => {
                                if (!date) {
                                    return <div key={index} style={{ aspectRatio: '1', padding: '0.5rem' }} />;
                                }

                                const isToday = date.toDateString() === today.toDateString();
                                const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                                const hasPlans = hasPlansOnDate(date);
                                const planCount = getPlanCountOnDate(date);
                                const isPast = date < today;

                                const getButtonBg = () => {
                                    if (isSelected) return isDark ? '#374151' : '#f5f5f4';
                                    if (isToday) return isDark ? '#1e3a8a' : '#eff6ff';
                                    return isDark ? '#1f2937' : 'white';
                                };

                                const getHoverBg = () => {
                                    if (isSelected) return isDark ? '#374151' : '#f5f5f4';
                                    if (isToday) return isDark ? '#1e3a8a' : '#eff6ff';
                                    return isDark ? '#374151' : '#fafafa';
                                };

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleDateClick(date)}
                                        style={{
                                            aspectRatio: '1',
                                            border: isToday ? '2px solid #3b82f6' : isSelected ? (isDark ? '2px solid #6b7280' : '2px solid #1c1917') : `1px solid ${isDark ? '#374151' : '#e7e5e4'}`,
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem',
                                            background: getButtonBg(),
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            opacity: isPast ? 0.6 : 1,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = getHoverBg();
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = getButtonBg();
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: '0.875rem', fontWeight: isToday ? 600 : 400, color: isToday ? '#3b82f6' : (isDark ? '#f9fafb' : '#1c1917') }}>
                                            {date.getDate()}
                                        </span>
                                        {hasPlans && (
                                            <div style={{
                                                marginTop: '0.25rem',
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: '#3b82f6',
                                                position: 'relative',
                                            }}>
                                                {planCount > 1 && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        fontSize: '0.625rem',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: '16px',
                                                        height: '16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        {planCount}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 右侧：新建计划表单、选中日期的计划和即将到来的计划 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* 新建/编辑计划表单 */}
                    {showPlanForm && (
                        <div className="content-section">
                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: isDark ? '#f9fafb' : '#1c1917' }}>
                                        {editingPlan ? '编辑计划' : '新建计划'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowPlanForm(false);
                                            setEditingPlan(null);
                                            setFormData({ title: '', description: '', type: 'plan', planDate: '' });
                                        }}
                                        className="btn btn-outline btn-small"
                                        title="关闭"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: isDark ? '#d1d5db' : '#44403c' }}>
                                            标题 *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: `1px solid ${isDark ? '#4b5563' : '#e7e5e4'}`,
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                background: isDark ? '#374151' : '#ffffff',
                                                color: isDark ? '#f9fafb' : '#1c1917',
                                            }}
                                            placeholder="输入计划标题"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: isDark ? '#d1d5db' : '#44403c' }}>
                                            日期 *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.planDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, planDate: e.target.value }))}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: `1px solid ${isDark ? '#4b5563' : '#e7e5e4'}`,
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                background: isDark ? '#374151' : '#ffffff',
                                                color: isDark ? '#f9fafb' : '#1c1917',
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: isDark ? '#d1d5db' : '#44403c' }}>
                                            类型 *
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'plan' | 'exam' }))}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: `1px solid ${isDark ? '#4b5563' : '#e7e5e4'}`,
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                background: isDark ? '#374151' : '#ffffff',
                                                color: isDark ? '#f9fafb' : '#1c1917',
                                            }}
                                        >
                                            <option value="plan">计划</option>
                                            <option value="exam">考试</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: isDark ? '#d1d5db' : '#44403c' }}>
                                            描述
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: `1px solid ${isDark ? '#4b5563' : '#e7e5e4'}`,
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                minHeight: '80px',
                                                resize: 'vertical',
                                                background: isDark ? '#374151' : '#ffffff',
                                                color: isDark ? '#f9fafb' : '#1c1917',
                                            }}
                                            placeholder="输入计划描述（可选）"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => {
                                                setShowPlanForm(false);
                                                setEditingPlan(null);
                                                setFormData({ title: '', description: '', type: 'plan', planDate: '' });
                                            }}
                                            className="btn btn-outline btn-small"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                                            className="btn btn-primary btn-small"
                                        >
                                            {editingPlan ? '更新' : '创建'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 如果没有显示表单，显示新建计划按钮 */}
                    {!showPlanForm && (
                        <div className="content-section">
                            <div style={{ padding: '1rem' }}>
                                <button
                                    onClick={handleStartNewPlan}
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    <Plus size={18} />
                                    新建计划
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 选中日期的计划 */}
                    {selectedDate && !showPlanForm && (
                        <div className="content-section">
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: isDark ? '#f9fafb' : '#1c1917' }}>
                                    {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 的计划
                                </h3>
                                {selectedDatePlans.length === 0 ? (
                                    <p style={{ color: isDark ? '#9ca3af' : '#78716c', fontSize: '0.875rem', margin: 0 }}>该日期暂无计划</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {selectedDatePlans.map(plan => (
                                            <div
                                                key={plan.id}
                                                style={{
                                                    padding: '0.75rem',
                                                    border: `1px solid ${isDark ? '#374151' : '#e7e5e4'}`,
                                                    borderRadius: '0.5rem',
                                                    background: plan.completed ? (isDark ? '#374151' : '#f5f5f4') : (isDark ? '#1f2937' : 'white'),
                                                    opacity: plan.completed ? 0.7 : 1,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                    {plan.type === 'exam' ? (
                                                        <GraduationCap size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                                                    ) : (
                                                        <Clock size={18} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                                                    )}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, textDecoration: plan.completed ? 'line-through' : 'none', color: isDark ? '#f9fafb' : '#1c1917' }}>
                                                                {plan.title}
                                                            </h4>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                padding: '0.125rem 0.5rem',
                                                                borderRadius: '9999px',
                                                                background: plan.type === 'exam' ? '#fee2e2' : '#dbeafe',
                                                                color: plan.type === 'exam' ? '#991b1b' : '#1e40af',
                                                            }}>
                                                                {plan.type === 'exam' ? '考试' : '计划'}
                                                            </span>
                                                        </div>
                                                        {plan.description && (
                                                            <p style={{ margin: 0, fontSize: '0.8125rem', color: isDark ? '#9ca3af' : '#78716c' }}>
                                                                {plan.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleToggleComplete(plan)}
                                                        className="btn btn-outline btn-small"
                                                        style={{ flex: 1 }}
                                                    >
                                                        {plan.completed ? <X size={14} /> : <Check size={14} />}
                                                        {plan.completed ? '未完成' : '完成'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditPlan(plan)}
                                                        className="btn btn-outline btn-small"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePlan(plan.id)}
                                                        className="btn btn-danger btn-small"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 即将到来的计划 */}
                    {upcomingPlans.length > 0 && (
                        <div className="content-section">
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: isDark ? '#f9fafb' : '#1c1917' }}>即将到来</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {upcomingPlans.map(plan => {
                                        const planDate = new Date(plan.planDate);
                                        const daysUntil = Math.ceil((planDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                        return (
                                            <div
                                                key={plan.id}
                                        onClick={() => {
                                            setSelectedDate(planDate);
                                            setShowPlanForm(false);
                                            setEditingPlan(null);
                                        }}
                                                style={{
                                                    padding: '0.75rem',
                                                    border: `1px solid ${isDark ? '#374151' : '#e7e5e4'}`,
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    background: isDark ? '#1f2937' : 'white',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = isDark ? '#374151' : '#fafafa';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = isDark ? '#1f2937' : 'white';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    {plan.type === 'exam' ? (
                                                        <GraduationCap size={16} style={{ color: '#ef4444' }} />
                                                    ) : (
                                                        <Clock size={16} style={{ color: '#3b82f6' }} />
                                                    )}
                                                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, flex: 1, color: isDark ? '#f9fafb' : '#1c1917' }}>
                                                        {plan.title}
                                                    </h4>
                                                    <span style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#78716c' }}>
                                                        {daysUntil === 0 ? '今天' : daysUntil === 1 ? '明天' : `${daysUntil}天后`}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#78716c' }}>
                                                    {planDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ReviewPlanPage;


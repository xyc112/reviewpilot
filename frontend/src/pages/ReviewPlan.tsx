import React, { useState, useEffect, useMemo } from 'react';
import { ReviewPlan as ReviewPlanType } from '../types';
import { reviewPlanAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Calendar, Plus, Edit, Trash2, Check, X, Clock, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import '../styles/CourseUI.css';

const ReviewPlanPage: React.FC = () => {
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

    const getPlansForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
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
        const dateStr = date.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, planDate: dateStr }));
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
            <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>
        </div>
    );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => {
                        const today = new Date();
                        setSelectedDate(today);
                        setFormData(prev => ({ ...prev, planDate: today.toISOString().split('T')[0] }));
                        setShowPlanForm(true);
                        setEditingPlan(null);
                    }}
                    className="btn btn-primary"
                >
                    <Plus size={18} />
                    新建计划
                </button>
            </div>

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem', marginTop: '1.5rem' }}>
                {/* 日历 */}
                <div className="content-section">
                    <div style={{ padding: '1rem' }}>
                        {/* 月份导航 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <button onClick={handlePrevMonth} className="btn btn-outline btn-small">
                                <ChevronLeft size={18} />
                            </button>
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
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

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleDateClick(date)}
                                        style={{
                                            aspectRatio: '1',
                                            border: isToday ? '2px solid #3b82f6' : isSelected ? '2px solid #1c1917' : '1px solid #e7e5e4',
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem',
                                            background: isSelected ? '#f5f5f4' : isToday ? '#eff6ff' : 'white',
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
                                                e.currentTarget.style.background = '#fafafa';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = isToday ? '#eff6ff' : 'white';
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: '0.875rem', fontWeight: isToday ? 600 : 400, color: isToday ? '#3b82f6' : '#1c1917' }}>
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

                {/* 右侧：选中日期的计划和即将到来的计划 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* 选中日期的计划 */}
                    {selectedDate && (
                        <div className="content-section">
                            <div style={{ padding: '1rem' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>
                                    {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 的计划
                                </h3>
                                {selectedDatePlans.length === 0 ? (
                                    <p style={{ color: '#78716c', fontSize: '0.875rem', margin: 0 }}>该日期暂无计划</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {selectedDatePlans.map(plan => (
                                            <div
                                                key={plan.id}
                                                style={{
                                                    padding: '0.75rem',
                                                    border: '1px solid #e7e5e4',
                                                    borderRadius: '0.5rem',
                                                    background: plan.completed ? '#f5f5f4' : 'white',
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
                                                            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, textDecoration: plan.completed ? 'line-through' : 'none' }}>
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
                                                            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#78716c' }}>
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
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>即将到来</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {upcomingPlans.map(plan => {
                                        const planDate = new Date(plan.planDate);
                                        const daysUntil = Math.ceil((planDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                        return (
                                            <div
                                                key={plan.id}
                                                onClick={() => {
                                                    setSelectedDate(planDate);
                                                    setFormData(prev => ({ ...prev, planDate: plan.planDate }));
                                                }}
                                                style={{
                                                    padding: '0.75rem',
                                                    border: '1px solid #e7e5e4',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#fafafa';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'white';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    {plan.type === 'exam' ? (
                                                        <GraduationCap size={16} style={{ color: '#ef4444' }} />
                                                    ) : (
                                                        <Clock size={16} style={{ color: '#3b82f6' }} />
                                                    )}
                                                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, flex: 1 }}>
                                                        {plan.title}
                                                    </h4>
                                                    <span style={{ fontSize: '0.75rem', color: '#78716c' }}>
                                                        {daysUntil === 0 ? '今天' : daysUntil === 1 ? '明天' : `${daysUntil}天后`}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#78716c' }}>
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

            {/* 计划表单模态框 */}
            {showPlanForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }} onClick={() => {
                    setShowPlanForm(false);
                    setEditingPlan(null);
                    setFormData({ title: '', description: '', type: 'plan', planDate: '' });
                }}>
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '0.5rem',
                            padding: '1.5rem',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
                            {editingPlan ? '编辑计划' : '新建计划'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    标题 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e7e5e4',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                    }}
                                    placeholder="输入计划标题"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    日期 *
                                </label>
                                <input
                                    type="date"
                                    value={formData.planDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, planDate: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e7e5e4',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    类型 *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'plan' | 'exam' }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e7e5e4',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    <option value="plan">计划</option>
                                    <option value="exam">考试</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                    描述
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e7e5e4',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        minHeight: '100px',
                                        resize: 'vertical',
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
                                    className="btn btn-outline"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                                    className="btn btn-primary"
                                >
                                    {editingPlan ? '更新' : '创建'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewPlanPage;


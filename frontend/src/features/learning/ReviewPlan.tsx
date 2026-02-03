import { useState, useEffect, useMemo } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { ReviewPlan as ReviewPlanType } from "@/shared/types";
import { reviewPlanAPI } from "@/shared/api";
import { useToast, ConfirmDialog } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { LoadingSpinner } from "@/shared/components";

const ReviewPlanPage = () => {
  const [plans, setPlans] = useState<ReviewPlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ReviewPlanType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    planId: number | null;
  }>({
    isOpen: false,
    planId: null,
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "plan" as "plan" | "exam",
    planDate: "",
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    void fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅挂载时拉取
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
    } catch (err: unknown) {
      showError("获取复习计划失败: " + getErrorMessage(err));
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
    return date.toLocaleDateString("en-CA"); // en-CA 区分度低，直接返回 2025-12-23 格式
  };

  const getPlansForDate = (date: Date) => {
    const dateStr = formatDateLocal(date);
    return plans.filter((plan) => plan.planDate === dateStr);
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
    const dateToUse = selectedDate ?? new Date();
    const dateStr = formatDateLocal(dateToUse);
    setSelectedDate(dateToUse);
    setFormData({
      title: "",
      description: "",
      type: "plan",
      planDate: dateStr,
    });
    setShowPlanForm(true);
    setEditingPlan(null);
  };

  const handleCreatePlan = async () => {
    if (!formData.title.trim() || !formData.planDate) {
      showError("请填写标题和日期");
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
      success("复习计划创建成功");
      setShowPlanForm(false);
      setFormData({ title: "", description: "", type: "plan", planDate: "" });
      // 如果创建的计划日期被选中，刷新选中日期的显示
      if (formData.planDate) {
        const planDate = new Date(formData.planDate);
        setSelectedDate(planDate);
      }
      await fetchPlans();
    } catch (err: unknown) {
      showError("创建复习计划失败: " + getErrorMessage(err));
    }
  };

  const handleEditPlan = (plan: ReviewPlanType) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description ?? "",
      type: plan.type,
      planDate: plan.planDate,
    });
    setShowPlanForm(true);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !formData.title.trim()) {
      showError("请填写标题");
      return;
    }

    try {
      await reviewPlanAPI.updatePlan(editingPlan.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        planDate: formData.planDate,
      });
      success("复习计划更新成功");
      setShowPlanForm(false);
      setEditingPlan(null);
      setFormData({ title: "", description: "", type: "plan", planDate: "" });
      // 刷新选中日期的显示
      if (selectedDate) {
        const dateStr = formatDateLocal(selectedDate);
        if (dateStr === formData.planDate || dateStr === editingPlan.planDate) {
          // 如果更新后的日期仍然是选中日期，保持选中
        }
      }
      await fetchPlans();
    } catch (err: unknown) {
      showError("更新复习计划失败: " + (getErrorMessage(err) || "未知错误"));
    }
  };

  const handleDeletePlan = (planId: number) => {
    setDeleteConfirm({ isOpen: true, planId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.planId) return;
    try {
      await reviewPlanAPI.deletePlan(deleteConfirm.planId);
      success("复习计划删除成功");
      await fetchPlans();
    } catch (err: unknown) {
      showError("删除复习计划失败: " + (getErrorMessage(err) || "未知错误"));
    } finally {
      setDeleteConfirm({ isOpen: false, planId: null });
    }
  };

  const handleToggleComplete = async (plan: ReviewPlanType) => {
    try {
      await reviewPlanAPI.updatePlan(plan.id, { completed: !plan.completed });
      success(plan.completed ? "已标记为未完成" : "已标记为完成");
      await fetchPlans();
    } catch (err: unknown) {
      showError("更新状态失败: " + (getErrorMessage(err) || "未知错误"));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const selectedDatePlans = useMemo(() => {
    if (!selectedDate) return [];
    return getPlansForDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getPlansForDate 依赖 plans
  }, [selectedDate, plans]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingPlans = useMemo(() => {
    return plans
      .filter((plan) => {
        const planDate = new Date(plan.planDate);
        planDate.setHours(0, 0, 0, 0);
        return planDate >= today && !plan.completed;
      })
      .sort((a, b) => a.planDate.localeCompare(b.planDate))
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- today 为常量
  }, [plans]);

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="mx-auto w-full max-w-[1150px] flex-1 overflow-auto px-4 py-4">
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          title="删除复习计划"
          message="确定要删除这个复习计划吗？此操作无法撤销。"
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={() => {
            void confirmDelete();
          }}
          onCancel={() => {
            setDeleteConfirm({ isOpen: false, planId: null });
          }}
        />

        {/* 日历和计划列表 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] items-start">
          {/* 日历 */}
          <Card>
            <CardContent className="p-4">
              {/* 月份导航 */}
              <div className="mb-4 flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="size-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {currentDate.getFullYear()}年{" "}
                  {monthNames[currentDate.getMonth()]}
                </h3>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* 星期标题 */}
              <div className="mb-2 grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-semibold text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 日期网格 */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square p-2" />;
                  }

                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected =
                    date.toDateString() === selectedDate?.toDateString();
                  const hasPlans = hasPlansOnDate(date);
                  const planCount = getPlanCountOnDate(date);
                  const isPast = date < today;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        handleDateClick(date);
                      }}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 p-2 transition-all relative ${
                        isPast ? "opacity-60" : ""
                      } ${
                        isToday
                          ? "border-primary bg-primary/10"
                          : isSelected
                            ? "border-foreground bg-muted"
                            : "border-border bg-background hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`text-sm ${isToday ? "font-semibold text-primary" : "text-foreground"}`}
                      >
                        {date.getDate()}
                      </span>
                      {hasPlans ? (
                        <div className="relative mt-1 size-1.5 rounded-full bg-primary">
                          {planCount > 1 && (
                            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                              {planCount}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 右侧：新建计划表单、选中日期的计划和即将到来的计划 */}
          <div className="flex flex-col gap-6">
            {/* 新建/编辑计划表单 */}
            {showPlanForm ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {editingPlan ? "编辑计划" : "新建计划"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowPlanForm(false);
                        setEditingPlan(null);
                        setFormData({
                          title: "",
                          description: "",
                          type: "plan",
                          planDate: "",
                        });
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="plan-title">标题</Label>
                      <Input
                        id="plan-title"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }));
                        }}
                        placeholder="输入计划标题"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="plan-date">日期</Label>
                      <Input
                        id="plan-date"
                        type="date"
                        value={formData.planDate}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            planDate: e.target.value,
                          }));
                        }}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>类型</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: "plan" | "exam") => {
                          setFormData((prev) => ({
                            ...prev,
                            type: value,
                          }));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plan">计划</SelectItem>
                          <SelectItem value="exam">考试</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="plan-desc">描述</Label>
                      <Textarea
                        id="plan-desc"
                        value={formData.description}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }));
                        }}
                        rows={4}
                        placeholder="输入计划描述（可选）"
                        className="resize-none"
                      />
                    </div>
                    <div className="flex w-full justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPlanForm(false);
                          setEditingPlan(null);
                          setFormData({
                            title: "",
                            description: "",
                            type: "plan",
                            planDate: "",
                          });
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={() => {
                          void (editingPlan
                            ? handleUpdatePlan()
                            : handleCreatePlan());
                        }}
                      >
                        {editingPlan ? "更新" : "创建"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* 如果没有显示表单，显示新建计划按钮 */}
            {!showPlanForm && (
              <Card>
                <CardContent className="p-4">
                  <Button className="w-full" onClick={handleStartNewPlan}>
                    <Plus className="size-4" />
                    新建计划
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 选中日期的计划 */}
            {selectedDate && !showPlanForm ? (
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-4 text-base font-semibold">
                    {selectedDate.toLocaleDateString("zh-CN", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    的计划
                  </h4>
                  {selectedDatePlans.length === 0 ? (
                    <p className="m-0 text-sm text-muted-foreground">
                      该日期暂无计划
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedDatePlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`rounded-lg border border-border p-3 ${
                            plan.completed ? "bg-muted opacity-70" : "bg-card"
                          }`}
                        >
                          <div className="mb-2 flex items-start gap-2">
                            {plan.type === "exam" ? (
                              <span className="text-lg text-red-500">🎓</span>
                            ) : (
                              <Clock className="size-5 text-primary" />
                            )}
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <h4
                                  className={`text-sm font-semibold ${
                                    plan.completed ? "line-through" : ""
                                  }`}
                                >
                                  {plan.title}
                                </h4>
                                <Badge
                                  variant={
                                    plan.type === "exam"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {plan.type === "exam" ? "考试" : "计划"}
                                </Badge>
                              </div>
                              {plan.description ? (
                                <p className="m-0 text-xs text-muted-foreground">
                                  {plan.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant={plan.completed ? "outline" : "default"}
                              className="flex-1"
                              onClick={() => {
                                void handleToggleComplete(plan);
                              }}
                            >
                              {plan.completed ? (
                                <X className="size-4" />
                              ) : (
                                <Check className="size-4" />
                              )}
                              {plan.completed ? "未完成" : "完成"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                handleEditPlan(plan);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                handleDeletePlan(plan.id);
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* 即将到来的计划 */}
            {upcomingPlans.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-4 text-base font-semibold">即将到来</h4>
                  <div className="flex flex-col gap-3">
                    {upcomingPlans.map((plan) => {
                      const planDate = new Date(plan.planDate);
                      const daysUntil = Math.ceil(
                        (planDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      return (
                        <div
                          key={plan.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedDate(planDate);
                            setShowPlanForm(false);
                            setEditingPlan(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedDate(planDate);
                              setShowPlanForm(false);
                              setEditingPlan(null);
                            }
                          }}
                          className="cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                        >
                          <div className="mb-1 flex items-center gap-2">
                            {plan.type === "exam" ? (
                              <span className="text-base text-red-500">🎓</span>
                            ) : (
                              <Clock className="size-4 text-primary" />
                            )}
                            <span className="flex-1 text-sm font-semibold">
                              {plan.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {daysUntil === 0
                                ? "今天"
                                : daysUntil === 1
                                  ? "明天"
                                  : `${String(daysUntil)}天后`}
                            </span>
                          </div>
                          <p className="m-0 text-xs text-muted-foreground">
                            {planDate.toLocaleDateString("zh-CN", {
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPlanPage;

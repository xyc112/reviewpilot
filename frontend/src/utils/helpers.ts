import dayjs from "dayjs";
import { KnowledgePoint } from "@/utils/types.ts";

/**
 * 格式化日期
 */
export const formatDate = (
  date: string | Date,
  format = "YYYY-MM-DD HH:mm",
): string => {
  return dayjs(date).format(format);
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * 根据分数计算掌握程度
 */
export const calculateMasteryLevel = (
  score: number,
): "weak" | "medium" | "strong" => {
  if (score >= 80) return "strong";
  if (score >= 60) return "medium";
  return "weak";
};

/**
 * 根据进度百分比获取颜色
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return "#52c41a";
  if (percentage >= 60) return "#faad14";
  return "#ff4d4f";
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 数组分组
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};

/**
 * 获取知识点显示名称
 */
export const getKnowledgePointDisplayName = (point: KnowledgePoint): string => {
  return `${point.name} (${point.masteryScore}%)`;
};

/**
 * 计算学习进度
 */
export const calculateLearningProgress = (points: KnowledgePoint[]) => {
  const total = points.length;
  const completed = points.filter((p) => p.masteryScore >= 60).length;
  const mastered = points.filter((p) => p.masteryScore >= 80).length;
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    completed,
    mastered,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
  };
};

/**
 * 生成随机ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证密码强度
 */
export const validatePassword = (
  password: string,
): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: "密码长度至少6位" };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: "密码必须包含大小写字母" };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "密码必须包含数字" };
  }
  return { valid: true, message: "密码强度足够" };
};

/**
 * 本地存储工具函数
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Local storage set error:", error);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Local storage remove error:", error);
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Local storage clear error:", error);
    }
  },
};

/**
 * 下载文件
 */
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // 降级方案
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  }
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 深度克隆对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array)
    return obj.map((item) => deepClone(item)) as unknown as T;

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * 生成颜色梯度
 */
export const generateColorGradient = (
  startColor: string,
  endColor: string,
  steps: number,
): string[] => {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);

  if (!start || !end) return [];

  const colors = [];
  for (let i = 0; i < steps; i++) {
    const r = Math.round(start.r + (end.r - start.r) * (i / (steps - 1)));
    const g = Math.round(start.g + (end.g - start.g) * (i / (steps - 1)));
    const b = Math.round(start.b + (end.b - start.b) * (i / (steps - 1)));
    colors.push(rgbToHex(r, g, b));
  }

  return colors;
};

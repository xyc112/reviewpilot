import type { User } from "@/shared/types";

/**
 * 从 unknown 错误中提取可读消息（兼容 axios 等）
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { message?: string } } }).response
      ?.data?.message === "string"
  ) {
    return (err as { response: { data: { message: string } } }).response.data
      .message;
  }
  return String(err);
}

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("selectedCourse");
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem("token");
};

export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;

  try {
    return JSON.parse(userData) as User;
  } catch {
    console.error("解析用户数据失败");
    clearAuthData();
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};

import { useState } from "react";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateUsername = (username: string): string | null => {
  if (!username || username.trim().length === 0) {
    return "用户名不能为空";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password || password.length === 0) {
    return "密码不能为空";
  }
  if (password.length < 6) {
    return "密码至少需要6个字符";
  }
  if (password.length > 50) {
    return "密码不能超过50个字符";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return "邮箱不能为空";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "请输入有效的邮箱地址";
  }
  return null;
};

export const validateTitle = (
  title: string,
  minLength = 1,
  maxLength = 100,
): string | null => {
  if (!title || title.trim().length === 0) {
    return "标题不能为空";
  }
  if (title.length < minLength) {
    return `标题至少需要${String(minLength)}个字符`;
  }
  if (title.length > maxLength) {
    return `标题不能超过${String(maxLength)}个字符`;
  }
  return null;
};

export const validateDescription = (
  description: string,
  maxLength = 1000,
): string | null => {
  if (description && description.length > maxLength) {
    return `描述不能超过${String(maxLength)}个字符`;
  }
  return null;
};

export const useFieldValidation = <T extends Record<string, unknown>>(
  initialValues: T,
  validators: Partial<Record<keyof T, (value: unknown) => string | null>>,
) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: keyof T, value: unknown) => {
    const validator = validators[name];
    if (validator) {
      const error = validator(value);
      setErrors((prev) => ({
        ...prev,
        [name]: error ?? "",
      }));
      return error === null;
    }
    return true;
  };

  const handleBlur = (name: keyof T) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleChange = (name: keyof T, value: unknown) => {
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const validateAll = (values: T): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    Object.keys(validators).forEach((key) => {
      const validator = validators[key as keyof T];
      if (validator) {
        const error = validator(values[key as keyof T]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validators).reduce<Record<string, boolean>>((acc, key) => {
        acc[key] = true;
        return acc;
      }, {}),
    );

    return isValid;
  };

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    handleChange,
    validateAll,
  };
};

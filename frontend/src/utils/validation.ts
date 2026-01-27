// 表单验证工具函数
import React from "react";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateUsername = (username: string): string | null => {
  if (!username || username.trim().length === 0) {
    return "用户名不能为空";
  }
  // 移除长度和字符限制，允许中文等任意字符
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
  minLength: number = 1,
  maxLength: number = 100,
): string | null => {
  if (!title || title.trim().length === 0) {
    return "标题不能为空";
  }
  if (title.length < minLength) {
    return `标题至少需要${minLength}个字符`;
  }
  if (title.length > maxLength) {
    return `标题不能超过${maxLength}个字符`;
  }
  return null;
};

export const validateDescription = (
  description: string,
  maxLength: number = 1000,
): string | null => {
  if (description && description.length > maxLength) {
    return `描述不能超过${maxLength}个字符`;
  }
  return null;
};

// 实时验证函数
export const useFieldValidation = <T extends Record<string, any>>(
  initialValues: T,
  validators: Partial<Record<keyof T, (value: any) => string | null>>,
) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (name: keyof T, value: any) => {
    const validator = validators[name];
    if (validator) {
      const error = validator(value);
      setErrors((prev) => ({
        ...prev,
        [name]: error || "",
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

  const handleChange = (name: keyof T, value: any) => {
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
      Object.keys(validators).reduce(
        (acc, key) => {
          acc[key] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
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

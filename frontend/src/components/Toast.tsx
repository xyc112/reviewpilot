import React, { createContext, useContext, ReactNode } from "react";
import { message } from "antd";

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const success = (msg: string) => {
    message.success(msg);
  };

  const error = (msg: string) => {
    message.error(msg);
  };

  const info = (msg: string) => {
    message.info(msg);
  };

  const warning = (msg: string) => {
    message.warning(msg);
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

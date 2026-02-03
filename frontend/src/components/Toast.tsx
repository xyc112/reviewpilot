import { createContext, useContext, type ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const success = (msg: string) => {
    sonnerToast.success(msg);
  };

  const error = (msg: string) => {
    sonnerToast.error(msg);
  };

  const info = (msg: string) => {
    sonnerToast.info(msg);
  };

  const warning = (msg: string) => {
    sonnerToast.warning(msg);
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

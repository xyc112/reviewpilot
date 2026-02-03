import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface FormErrorMessageProps {
  message: string;
  className?: string;
}

const FormErrorMessage = ({ message, className }: FormErrorMessageProps) => (
  <div
    role="alert"
    className={cn(
      "flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive",
      className,
    )}
  >
    <AlertCircle className="size-4 shrink-0" aria-hidden />
    <span>{message}</span>
  </div>
);

export default FormErrorMessage;

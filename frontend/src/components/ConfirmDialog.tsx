import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

const iconColorClass = {
  danger: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
} as const;

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  type = "info",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Modal
      open={isOpen}
      title={
        <div className="flex items-center gap-3">
          <ExclamationCircleOutlined
            className={`text-xl ${iconColorClass[type]}`}
          />
          <span className="text-base font-semibold text-stone-900 dark:text-stone-100">
            {title}
          </span>
        </div>
      }
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{
        danger: type === "danger",
        className: "rounded-xl font-medium",
      }}
      cancelButtonProps={{
        className: "rounded-xl",
      }}
      className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-stone-200 [&_.ant-modal-header]:pb-4 dark:[&_.ant-modal-header]:border-neutral-700"
    >
      <p className="m-0 leading-relaxed text-stone-700 dark:text-stone-300">
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmDialog;

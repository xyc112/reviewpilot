import React from "react";
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

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  type = "info",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={isOpen}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ExclamationCircleOutlined
            style={{
              color:
                type === "danger"
                  ? "#ff4d4f"
                  : type === "warning"
                    ? "#faad14"
                    : "#1890ff",
            }}
          />
          <span>{title}</span>
        </div>
      }
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{
        danger: type === "danger",
      }}
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;

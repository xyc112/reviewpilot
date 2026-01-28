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

const ConfirmDialog = ({
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
                    : "#1677ff",
              fontSize: 20,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
        </div>
      }
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{
        danger: type === "danger",
        style: { borderRadius: 8, fontWeight: 500 },
      }}
      cancelButtonProps={{
        style: { borderRadius: 8 },
      }}
      style={{ borderRadius: 12 }}
    >
      <p style={{ margin: 0, lineHeight: 1.6, color: "rgba(0, 0, 0, 0.88)" }}>
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmDialog;

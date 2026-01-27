import React from "react";
import { AlertTriangle, X } from "lucide-react";
import "./ConfirmDialog.css";

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
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <div className="confirm-dialog-icon-wrapper">
            {type === "danger" && (
              <AlertTriangle className="confirm-dialog-icon danger" />
            )}
            {type === "warning" && (
              <AlertTriangle className="confirm-dialog-icon warning" />
            )}
            {type === "info" && (
              <AlertTriangle className="confirm-dialog-icon info" />
            )}
          </div>
          <h3 className="confirm-dialog-title">{title}</h3>
          <button
            className="confirm-dialog-close"
            onClick={onCancel}
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>
        <div className="confirm-dialog-body">
          <p>{message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <button
            className={`btn btn-outline confirm-dialog-btn-cancel`}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${
              type === "danger" ? "btn-danger" : "btn-primary"
            } confirm-dialog-btn-confirm`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

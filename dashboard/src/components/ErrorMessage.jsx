import React from 'react';
import { MdError, MdWarning, MdInfo, MdCheckCircle, MdClose } from 'react-icons/md';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  onClose, 
  show = true,
  autoClose = false,
  duration = 5000,
  showConfirm = false,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  React.useEffect(() => {
    if (autoClose && show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, show, duration, onClose]);

  if (!show || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <MdCheckCircle className="error-icon success" />;
      case 'warning':
        return <MdWarning className="error-icon warning" />;
      case 'info':
        return <MdInfo className="error-icon info" />;
      default:
        return <MdError className="error-icon error" />;
    }
  };

  return (
    <div className={`error-message ${type}`}>
      <div className="error-content">
        {getIcon()}
        <span className="error-text">{message}</span>
        {showConfirm ? (
          <div className="error-actions">
            <button 
              className="error-btn confirm-btn" 
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button 
              className="error-btn cancel-btn" 
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        ) : onClose && (
          <button 
            className="error-close" 
            onClick={onClose}
            aria-label="Close error message"
          >
            <MdClose />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

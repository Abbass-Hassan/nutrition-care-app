import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

const Notification = ({ message, type = 'success', onClose, autoClose = true }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <MdCheckCircle />;
      case 'error':
        return <MdError />;
      case 'warning':
        return <MdWarning />;
      case 'info':
        return <MdInfo />;
      default:
        return <MdCheckCircle />;
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon()}</span>
        <div className="notification-message">
          {message.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
        <button className="notification-close" onClick={onClose}>
          <MdClose />
        </button>
      </div>
    </div>
  );
};

export default Notification; 
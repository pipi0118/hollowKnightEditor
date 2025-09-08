import React from 'react';

interface NotificationMessagesProps {
  error: string;
  success: string;
  onClearError: () => void;
  onClearSuccess: () => void;
}

export const NotificationMessages: React.FC<NotificationMessagesProps> = ({
  error,
  success,
  onClearError,
  onClearSuccess,
}) => {
  return (
    <>
      {/* 错误提示 */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="close-btn" onClick={onClearError}>×</button>
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span>{success}</span>
          <button className="close-btn" onClick={onClearSuccess}>×</button>
        </div>
      )}
    </>
  );
};
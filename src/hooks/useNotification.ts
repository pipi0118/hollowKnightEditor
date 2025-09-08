import { useState, useCallback } from 'react';

export interface NotificationState {
  error: string;
  success: string;
}

/**
 * 通知消息的自定义Hook
 */
export const useNotification = () => {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const showError = useCallback((message: string): void => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  }, []);

  const showSuccess = useCallback((message: string): void => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  }, []);

  const clearError = useCallback((): void => {
    setError('');
  }, []);

  const clearSuccess = useCallback((): void => {
    setSuccess('');
  }, []);

  return {
    error,
    success,
    showError,
    showSuccess,
    clearError,
    clearSuccess,
  };
};
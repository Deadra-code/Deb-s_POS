/* eslint-disable react-refresh/only-export-components */
'use client';

import * as React from 'react';
import { ToastProvider, ToastViewport } from '../components/ui/Toast';

const ToastProviderComponent = ToastProvider;

export function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback(({ title, description, variant, duration = 3000, onDismiss }) => {
    const id = Math.random().toString(36).substr(2, 9);

    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant }]);

    if (duration !== null) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        if (onDismiss) onDismiss();
      }, duration);
    }
  }, []);

  const dismiss = React.useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    toast,
    dismiss,
  };
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProviderComponent>
      {toasts.map(({ id, title, description, variant }) => (
        <ToastComponent
          key={id}
          id={id}
          title={title}
          description={description}
          variant={variant}
          onDismiss={() => dismiss(id)}
        />
      ))}
      <ToastViewport />
    </ToastProviderComponent>
  );
}

import { Toast, ToastTitle, ToastDescription, ToastClose } from '../components/ui/Toast';
import { cn } from '../lib/utils';

function ToastComponent({ title, description, variant, onDismiss }) {
  return (
    <Toast variant={variant}>
      <div className="grid gap-1">
        {title && <ToastTitle className={cn(variant === 'success' ? 'text-emerald-700 dark:text-emerald-300' : '')}>{title}</ToastTitle>}
        {description && (
          <ToastDescription className={cn(variant === 'success' ? 'text-emerald-600 dark:text-emerald-400' : '')}>
            {description}
          </ToastDescription>
        )}
      </div>
      <ToastClose onClick={onDismiss} />
    </Toast>
  );
}

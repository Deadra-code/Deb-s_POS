import { useEffect } from 'react';
import { useToast } from '../hooks';
import { subscribeToDbErrors, getErrorMessage } from '../utils/db-error-handler';

/**
 * Database Error Listener Component
 * Listens for database errors and displays toast notifications
 * Add this component once at the app root level
 */
const DatabaseErrorListener = () => {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToDbErrors((operation, errorMessage) => {
      const userMessage = getErrorMessage(operation);
      
      toast({
        title: 'Terjadi Kesalahan',
        description: `${userMessage}. Silakan coba lagi.`,
        variant: 'destructive',
        duration: 5000,
      });

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[DB Error] ${operation}: ${errorMessage}`);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  return null;
};

export default DatabaseErrorListener;

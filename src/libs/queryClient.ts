import { QueryClient } from '@tanstack/react-query';
import type { ApiError } from './api';
import axios from 'axios';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (count, error) => {
        if (axios.isCancel(error)) return false;

        const s = error.status;

        if (s && s >= 400 && s < 500) return false;
        
        return count < 2;
      },
    },
  },
});
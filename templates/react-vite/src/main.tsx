import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router';
import { SEOProvider } from './components/SEO';
import './index.css';
import { queryClient } from './lib/queryClient';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SEOProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SEOProvider>
  </StrictMode>
);

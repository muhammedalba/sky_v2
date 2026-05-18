'use client';

import dynamic from 'next/dynamic';
import { useServerNotifications } from '@/shared/hooks/useServerNotifications';

const ToastContainer = dynamic(() => import('./ToastContainer'), { ssr: false });

export default function ToastProvider() {
  useServerNotifications();
  return <ToastContainer />;
}


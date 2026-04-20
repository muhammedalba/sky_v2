'use client';

import dynamic from 'next/dynamic';

const ToastContainer = dynamic(() => import('./ToastContainer'), { ssr: false });

export default function ToastProvider() {
  return <ToastContainer />;
}

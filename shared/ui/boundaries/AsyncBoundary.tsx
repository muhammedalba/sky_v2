'use client';

import React, { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import Spinner from '@/shared/ui/Spinner';

interface AsyncBoundaryProps {
  children: ReactNode;
  pendingFallback?: ReactNode;
  rejectedFallback?: ReactNode;
  onReset?: () => void;
}

export function AsyncBoundary({
  children,
  pendingFallback = (
    <div className="flex justify-center items-center w-full h-32">
      <Spinner size="lg" />
    </div>
  ),
  rejectedFallback,
  onReset,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={rejectedFallback} onReset={onReset}>
      <Suspense fallback={pendingFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

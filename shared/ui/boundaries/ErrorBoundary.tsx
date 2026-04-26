'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 border border-destructive/20 bg-destructive/5 rounded-lg text-center space-y-4">
          <div className="text-destructive font-semibold">
            Something went wrong!
          </div>
          <p className="text-sm text-destructive/70 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
          </p>
          <Button variant="outline" onClick={this.handleReset} className="border-destructive/20 text-destructive hover:bg-destructive/10">
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

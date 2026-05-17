'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';

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
        <div className="flex flex-col items-center justify-center p-8 my-6 border border-destructive/20 dark:border-destructive/30 bg-destructive/5 dark:bg-destructive/10 rounded-3xl text-center space-y-5 backdrop-blur-md shadow-xl shadow-destructive/5 max-w-lg mx-auto animate-fade-in group transition-all duration-300 hover:border-destructive/40">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform duration-300 shadow-inner">
            <Icons.Warning className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground tracking-tight">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed px-2 line-clamp-3">
              {this.state.error?.message || 'An unexpected error occurred while rendering this component. Our team has been notified.'}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={this.handleReset}
            className="rounded-2xl h-12 px-6 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-bold tracking-wide shadow-md shadow-destructive/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5"
          >
            <Icons.RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('EasyEquate ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-4 sm:p-6 rounded-2xl bg-[#FFF8F6] dark:bg-[#201514] border-2 border-red-200 dark:border-red-900/40 text-left space-y-3 my-2 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-mono font-bold text-xs uppercase tracking-wider">
            <AlertCircle size={16} className="shrink-0" />
            <span>{this.props.fallbackTitle || 'Solver Error'}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4E342E] dark:text-[#EFEBE9] leading-relaxed">
            This expression could not be calculated due to an unexpected format or syntax issue.
            {this.state.error?.message ? (
              <span className="block mt-1 font-mono text-xs text-red-600 dark:text-red-300 bg-red-100/50 dark:bg-red-950/40 px-2 py-1 rounded break-words">
                {this.state.error.message}
              </span>
            ) : null}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5D4037] hover:bg-[#4E342E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw size={13} />
              Reset & Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

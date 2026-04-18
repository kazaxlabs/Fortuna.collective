import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
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

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      try {
        const parsedError = JSON.parse(this.state.error?.message || '{}');
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} (Op: ${parsedError.operationType}, Path: ${parsedError.path})`;
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-6 text-[var(--color-text)]">
          <div className="max-w-md w-full neu-convex rounded-[3rem] p-12 text-center space-y-10 shadow-2xl">
            <div className="w-20 h-20 neu-concave rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-[#FF3B30] shadow-inner">
              <span className="text-4xl font-black">!</span>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight uppercase leading-none">System Disruption</h2>
              <p className="text-sm text-[var(--color-text)] opacity-40 leading-relaxed font-bold italic uppercase tracking-wider">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-5 neu-button-accent text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
            >
              Reinitialize Context
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

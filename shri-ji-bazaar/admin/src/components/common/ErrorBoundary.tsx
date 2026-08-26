import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-error text-sm mb-2">Something went wrong</p>
            <p className="text-text-muted text-xs">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

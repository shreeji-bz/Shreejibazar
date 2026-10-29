import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message?: string; }

/**
 * Catches any render error in the admin tree and shows a clear, recoverable
 * screen instead of a silent white page. A single "Reload" button restores
 * the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error: Error) {
    // Surface it in the console for diagnosis; the UI below handles recovery.
    console.error('[Admin] render error caught by ErrorBoundary', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-xl overflow-hidden mb-4">
              <img src="/assets/logo.webp" alt="Shri Ji Bazaar" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-bold text-gold-bright mb-2">Something went wrong</h1>
            <p className="text-text-secondary text-sm mb-5 break-words">
              {this.state.message || 'The admin panel hit an unexpected error.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-lg bg-gold-bright text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

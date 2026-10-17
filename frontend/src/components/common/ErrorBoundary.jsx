import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary — React class component that catches unhandled render errors.
 * Displays a user-friendly fallback UI instead of a blank screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <ComponentThatMightCrash />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In production, this would send to an error monitoring service (Sentry etc)
    console.error('[BharatSeva ErrorBoundary] Uncaught render error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload() {
    window.location.reload();
  }

  handleHome() {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-red-100 shadow-xl p-8 text-center space-y-5">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                BharatSeva AI encountered an unexpected error. Your data is safe. 
                Please try refreshing the page or return to the home page.
              </p>
            </div>

            {/* Error Message (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-red-50 text-red-800 p-3 rounded-xl overflow-x-auto border border-red-100 max-h-32">
                {this.state.error.toString()}
              </pre>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => this.handleReload()}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>

              <button
                onClick={() => this.handleHome()}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>
            </div>

            {/* Support note */}
            <p className="text-[11px] text-slate-400">
              If this keeps happening, please clear your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

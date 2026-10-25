import React from 'react';
import { AlertCircle, RefreshCw, Repeat, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleResetState = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[480px] w-full flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-200">
          <div className="card-clean max-w-lg w-full p-6 sm:p-8 border-rose-200 bg-gradient-to-b from-rose-50/40 via-white to-white shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-rose-200">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Module Execution Interrupted
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              An unexpected client runtime condition occurred while rendering this institutional module. Your session data and school records remain safe.
            </p>

            {this.state.error?.message && (
              <div className="mt-4 p-3 rounded-xl bg-slate-900 text-slate-200 text-left font-mono text-[11px] overflow-x-auto border border-slate-800">
                <p className="text-rose-400 font-bold mb-1">Exception Details:</p>
                <p className="truncate">{this.state.error.message}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetState}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Dismiss & Return to Overview</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

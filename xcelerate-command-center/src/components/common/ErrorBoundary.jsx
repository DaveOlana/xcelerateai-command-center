import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleCopyDetails = () => {
    const { error, errorInfo } = this.state;
    const details = `Error: ${error?.toString()}\nComponent Stack: ${errorInfo?.componentStack}`;
    navigator.clipboard.writeText(details)
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 3000);
      })
      .catch((err) => console.error("Failed to copy error details", err));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="card w-full max-w-lg bg-navy-800 border border-red-500/30 text-center p-8 shadow-red-glow">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-500 font-mono"></span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Command Module Failed to Render</h2>
            <p className="text-xs text-slate-400 mb-6">
              This page encountered a rendering issue. The app is still running.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.hash = '#/';
                  window.location.reload();
                }}
                className="btn-primary py-2 px-4 text-xs font-bold"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.hash = '#/import';
                  window.location.reload();
                }}
                className="btn-secondary py-2 px-4 text-xs font-bold"
              >
                Open Import Roadmap
              </button>
              <button
                onClick={this.handleCopyDetails}
                className="btn-secondary py-2 px-4 text-xs font-bold text-slate-400 hover:text-white"
              >
                {this.state.copied ? 'Copied to Clipboard!' : 'Copy Error Details'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

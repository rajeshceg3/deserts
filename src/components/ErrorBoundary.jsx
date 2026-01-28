import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-screen bg-black text-white p-8">
          <h1 className="text-3xl font-serif mb-4 text-pastel-rose">Something went wrong.</h1>
          <p className="font-mono text-white/60 mb-8 max-w-lg text-center">
            The application encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-white/30 rounded-full hover:bg-white/10 transition-colors uppercase tracking-widest font-mono text-xs"
          >
            Refresh Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

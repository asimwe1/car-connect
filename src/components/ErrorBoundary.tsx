import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    // simple retry: reload route
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">An unexpected error occurred. Try again.</p>
            <button onClick={this.handleRetry} className="btn-hero px-4 py-2 rounded">Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}



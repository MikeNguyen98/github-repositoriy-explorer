import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  /** Named so the fallback can say which part failed rather than blanking the page. */
  area: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.area}]`, error, info.componentStack);
  }

  override componentDidUpdate(prevProps: Props) {
    if (prevProps.area !== this.props.area && this.state.error) {
      this.setState({ error: null });
    }
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="panel">
        <h2>{this.props.area}</h2>
        <div className="issue block">
          This panel stopped working: {error.message}
        </div>
        <button onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    );
  }
}

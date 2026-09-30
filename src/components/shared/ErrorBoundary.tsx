import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "./ErrorState";

interface Props {
  /** Changing it resets the boundary, e.g. the current route. */
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
      <div className="mx-auto max-w-xl px-4 py-16">
        <ErrorState
          title="Something went wrong"
          message={error.message}
          onRetry={() => this.setState({ error: null })}
        />
      </div>
    );
  }
}

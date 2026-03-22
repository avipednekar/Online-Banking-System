import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel error-panel">
          <span className="panel-label">Application error</span>
          <h2>Something went wrong in the interface.</h2>
          <p className="muted">
            Refresh the page or sign in again. If the problem persists, inspect the console and the
            failing API request.
          </p>
        </section>
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorBoundary — Catches render errors, prevents full white screen.
 * Wrap around any page-level component.
 *
 * Usage:
 *   <ErrorBoundary fallback={<CollectionsFallback />}>
 *     <Collections />
 *   </ErrorBoundary>
 */
import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Send to Sentry / LogRocket in production:
    // Sentry.captureException(error, { extra: info });
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              background: "#06060f",
              color: "rgba(255,255,255,0.5)",
              fontFamily: "Rajdhani, sans-serif",
            }}
          >
            <span style={{ fontSize: "40px", color: "rgba(255,255,255,0.2)" }}>
              ✦
            </span>
            <p style={{ fontSize: "16px", letterSpacing: "2px" }}>
              Something went wrong.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                fontFamily: "Bebas Neue, cursive",
                fontSize: "14px",
                letterSpacing: "3px",
                color: "#000",
                background: "var(--accent,#ff8c00)",
                border: "none",
                padding: "12px 28px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

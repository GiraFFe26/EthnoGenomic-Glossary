import React, { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: undefined,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error in UI", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="layout">
          <div className="card" style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700 }}>Что-то пошло не так</div>
            <div style={{ color: "#4b5563" }}>Перезагрузите страницу или очистите сохраненные данные браузера и попробуйте снова.</div>
            {this.state.message && <div style={{ color: "#b91c1c", fontSize: 14 }}>{this.state.message}</div>}
            <button
              onClick={() => window.location.reload()}
              style={{
                width: "fit-content",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #1b3672",
                background: "#1b3672",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Обновить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

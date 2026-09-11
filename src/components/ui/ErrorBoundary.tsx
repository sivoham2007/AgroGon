import React, { Component, type ReactNode } from "react";
import { ErrorState, PrimaryButton } from "./Primitives";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
          <ErrorState 
            title="An unexpected error occurred." 
            action={
              <div className="mt-4 flex flex-col gap-2 items-center">
                <p className="text-[12.5px] text-[#5E7568] max-w-sm text-center mb-2">
                  {this.state.error?.message || "The application encountered a runtime error. Please reload the page."}
                </p>
                <PrimaryButton onClick={this.handleReset}>
                  Reload Application
                </PrimaryButton>
              </div>
            } 
          />
        </div>
      );
    }

    return this.props.children;
  }
}

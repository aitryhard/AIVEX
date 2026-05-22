import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center max-w-md px-6">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Aivex</h1>
            <p className="text-sm text-white/60 mb-6">
              Что-то пошло не так. Перезапусти приложение или нажми кнопку ниже.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

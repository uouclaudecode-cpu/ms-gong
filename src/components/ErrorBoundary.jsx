// 화면 일부에서 오류가 나도 사이트 전체가 하얗게 되지 않게 막는 울타리.
//   <Safe name="뉴스"><NewsList … /></Safe>  → 뉴스만 '불러오지 못했어요'로 바뀝니다
//   Layout은 페이지 전체를 감싸고, 다른 페이지로 이동하면 다시 시도합니다(resetKey).
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[화면 오류] ${this.props.name ?? ''}`, error, info.componentStack);
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div role="alert" className="card flex flex-col items-center gap-2 px-4 py-8 text-center">
        <p className="text-2xl">🧩</p>
        <p className="text-sm font-semibold">
          {this.props.name && <span className="text-brand-600 dark:text-brand-300">{this.props.name} · </span>}
          불러오지 못했어요
        </p>
        <p className="muted text-xs">다른 부분은 그대로 쓸 수 있어요.</p>
        <button type="button" onClick={() => this.setState({ error: null })} className="btn-ghost mt-1 !py-1.5 text-xs">
          다시 시도
        </button>
      </div>
    );
  }
}

/** 짧게 쓰기용 */
export function Safe({ name, children }) {
  return <ErrorBoundary name={name}>{children}</ErrorBoundary>;
}

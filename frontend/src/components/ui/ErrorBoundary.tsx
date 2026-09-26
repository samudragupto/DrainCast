import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  label?: string
}

interface ErrorBoundaryState {
  failed: boolean
}

/**
 * Last-resort guard so a failure inside one region (e.g. the map stack)
 * shows a quiet fallback instead of unmounting the entire page.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[DrainCast] layer failure:', error.message, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-surface">
          <div className="max-w-xs rounded-xl border border-line bg-elevated px-5 py-4 text-center shadow-panel">
            <p className="text-[13px] font-semibold text-ink">
              {this.props.label ?? 'This section'} could not be displayed
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
              The nowcast engine is still running — refresh the page to restore the map.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

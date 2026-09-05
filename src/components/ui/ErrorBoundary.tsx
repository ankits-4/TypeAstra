import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface State {
  error: Error | null
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Kept minimal on purpose — no external logging service wired up.
    // eslint-disable-next-line no-console
    console.error('TypAstra crashed:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="min-h-screen bg-bg text-ink flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-bad/15 text-bad">
            <AlertTriangle size={20} />
          </div>
          <h1 className="text-lg font-semibold mb-1">Something went wrong</h1>
          <p className="text-sm text-muted mb-5">
            TypAstra hit an unexpected error. Your saved progress is untouched — reloading usually fixes this.
          </p>
          <button onClick={this.handleReload} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink">
            Reload
          </button>
        </div>
      </main>
    )
  }
}

import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8 text-center">
          <div>
            <h1 className="mb-2 text-xl font-bold text-gray-900">Something went wrong</h1>
            <p className="mb-4 text-gray-600">Please refresh the page and try again.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Refresh
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

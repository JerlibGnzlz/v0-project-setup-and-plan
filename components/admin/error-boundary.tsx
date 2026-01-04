'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('[ErrorBoundary] Error capturado:', error)
    console.error('[ErrorBoundary] Error info:', errorInfo)
    console.error('[ErrorBoundary] Stack:', error.stack)
  }

  handleReset = () => {
    // Limpiar storage y recargar
    if (typeof window !== 'undefined') {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/admin/login'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-sky-50/30 dark:to-sky-950/10 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="size-8 text-destructive" />
                <div>
                  <CardTitle>Error de aplicación</CardTitle>
                  <CardDescription>
                    Ocurrió un error inesperado. Por favor, intenta recargar la página.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm font-mono text-destructive break-all">
                    {this.state.error.message || 'Error desconocido'}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Ver detalles técnicos
                      </summary>
                      <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-48">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="gap-2">
                  <RefreshCw className="size-4" />
                  Limpiar y volver al login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  Recargar página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}


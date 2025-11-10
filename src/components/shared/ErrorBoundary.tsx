"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

/**
 * ErrorBoundary: Componente para capturar errores de React
 * - Muestra UI amigable cuando ocurre un error
 * - Proporciona botón para reintentar
 * - Sigue las convenciones del Sistema Maestro
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary capturó un error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Componente por defecto para mostrar errores
 */
function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full card-base p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-[color:var(--color-danger-500)]" aria-hidden />
        </div>
        
        <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)] mb-2">
          Ha ocurrido un error inesperado
        </h2>
        
        <p className="text-[color:var(--color-text-secondary)] mb-6">
          Lo sentimos, algo salió mal. Por favor intenta nuevamente.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-[color:var(--color-text-muted)] mb-2">
              Ver detalles del error (desarrollo)
            </summary>
            <div className="mt-2 p-3 bg-[color:var(--color-bg-secondary)] rounded text-xs font-mono text-[color:var(--color-text-secondary)] overflow-auto max-h-40">
              {error.message}
              <pre className="mt-2 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </div>
          </details>
        )}
        
        <div className="flex justify-center">
          <Button
            onClick={resetError}
            variant="primary"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" aria-hidden />}
          >
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  );
}
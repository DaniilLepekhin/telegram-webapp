'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
  resetKey: number;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    // Incrementing resetKey forces React to unmount and remount the subtree,
    // which clears any component-level error state that would otherwise cause
    // an immediate re-throw and an infinite reset loop.
    this.setState((prev) => ({
      hasError: false,
      error: undefined,
      resetKey: prev.resetKey + 1,
    }));
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-th-bg flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-xs"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/15 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-th font-bold text-lg mb-2">
              Что-то пошло не так
            </h2>
            <p className="text-th/40 text-sm mb-6">
              {this.state.error?.message ?? 'Неизвестная ошибка'}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="flex items-center gap-2 mx-auto glass px-5 py-2.5 rounded-xl text-sm text-th/70 hover:text-th transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Попробовать снова
            </button>
          </motion.div>
        </div>
      );
    }

    // resetKey forces a full remount of children after reset
    return (
      <React.Fragment key={this.state.resetKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

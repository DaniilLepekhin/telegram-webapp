'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-xs"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/15 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Что-то пошло не так</h2>
            <p className="text-white/40 text-sm mb-6">
              {this.state.error?.message ?? 'Неизвестная ошибка'}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="flex items-center gap-2 mx-auto glass px-5 py-2.5 rounded-xl text-sm text-white/70 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Попробовать снова
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

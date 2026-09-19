/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { SlotMachine } from './components/SlotMachine';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SlotMachine ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white font-cinzel">
          <div className="max-w-md p-6 bg-red-950/40 border border-red-800/80 rounded-2xl backdrop-blur-md shadow-2xl">
            <h2 className="text-xl font-bold text-red-500 mb-2">Covenant Restored</h2>
            <p className="text-sm text-neutral-300 mb-4 font-sans">
              Ocurrió un reinicio temporal en la cámara del castillo. Haz clic abajo para reanudar la partida.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-xl border border-red-500 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              Reanudar Tragamonedas
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    document.title = 'Blood Covenant – Gothic Slots';
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', 'Blood Covenant – tragamonedas gótica de vampiros con cinco rodillos, tiros gratis y bonus de ataúdes.');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    ogTitle?.setAttribute('content', 'Blood Covenant – Gothic Slots');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    ogDescription?.setAttribute('content', 'Blood Covenant – tragamonedas gótica de vampiros con tiros gratis y bonus de ataúdes.');
  }, []);

  return (
    <div id="app-root-container" className="w-full min-h-screen bg-black">
      <ErrorBoundary>
        <SlotMachine />
      </ErrorBoundary>
    </div>
  );
}

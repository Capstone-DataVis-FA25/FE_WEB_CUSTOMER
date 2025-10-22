import { useEffect, useState } from 'react';

interface SplashScreenProps {
  /**
   * Optional callback invoked when splash completes. If provided, SplashScreen will call
   * onDone() instead of performing internal navigation. This allows the app to control
   * the transition (for example rendering the router after the splash finishes).
   */
  onDone?: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let innerTimer: ReturnType<typeof setTimeout> | null = null;
    const timer = setTimeout(() => {
      setProgress(100);
      innerTimer = setTimeout(() => {
        if (onDone) {
          onDone();
        } else {
          try {
            window.location.replace('/');
          } catch (e) {
            window.location.href = '/';
          }
        }
      }, 500);
    }, 3500);

    return () => {
      clearTimeout(timer);
      if (innerTimer) clearTimeout(innerTimer);
    };
  }, [onDone]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob bg-blue-400/20 dark:bg-blue-800/30"></div>
        <div className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000 bg-pink-300/20 dark:bg-pink-700/25"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 bg-purple-300/20 dark:bg-purple-800/25"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo container with animation */}
        <div className="mb-8 animate-fade-in-scale">
          <div className="relative w-50 h-50 flex items-center justify-center">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-25 animate-pulse dark:opacity-30"></div>

            {/* Logo */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/remove_bg_logo-ZHPgfK6ogYcw9zzL37rPOJMcQJ8RTq.png"
              alt="DataVis Logo"
              className="w-80 h-80 object-contain relative z-10 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">DataVis</h1>
          <p className="text-lg text-primary font-semibold">Data Visualization</p>
        </div>

        {/* Loading indicator */}
        <div className="w-64 space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {/* Progress bar */}
          <div className="relative h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Loading text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-medium">
              Welcome to Nexora Production
            </p>
            <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Animated dots */}
        <div className="mt-8 flex gap-2 animate-fade-in" style={{ animationDelay: '0.9s' }}>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>

      {/* Footer - small 'from' label with Meta-style logo */}
      <div
        className="absolute bottom-6 w-full flex items-center justify-center animate-fade-in"
        style={{ animationDelay: '1.2s' }}
      >
        <div className="flex items-center gap-3 text-center text-xs text-slate-500">
          <div className="text-[11px]">from</div>
          {/* Simple inline Meta-style logo (infinite loop glyph) */}
          <div className="flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/remove_bg_logo-ZHPgfK6ogYcw9zzL37rPOJMcQJ8RTq.png"
              alt="DataVis logo"
              className="w-20 h-20 object-contain"
            />
            <span className="font-semibold text-sm text-blue-600">DataVis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

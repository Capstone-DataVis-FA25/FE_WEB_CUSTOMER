'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GalaxyBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function GalaxyBackground({ children, className }: GalaxyBackgroundProps) {
  return (
    <div className={cn('relative min-h-screen overflow-hidden', className)}>
      <div className="absolute inset-0 z-0">
        {/* Main galaxy background gradient using CSS variables */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-primary to-slate-900 dark:from-accent/80 dark:via-primary/60 dark:to-gray-950" />

        {/* Nebula clouds using brand colors */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute top-3/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>

        {/* Twinkling stars layer 1 - small stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={`star-small-${i}`}
              className="absolute w-1 h-1 bg-blue-200 dark:bg-blue-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>

        {/* Twinkling stars layer 2 - medium stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`star-medium-${i}`}
              className="absolute w-2 h-2 bg-blue-100 dark:bg-blue-200 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${3 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 4}s`,
                opacity: Math.random() * 0.6 + 0.3,
              }}
            />
          ))}
        </div>

        {/* Shooting stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`shooting-star-${i}`}
              className="absolute w-1 h-1 bg-secondary rounded-full opacity-0 shadow-lg"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animation: `shootingStar 8s linear infinite`,
                animationDelay: `${i * 3}s`,
                boxShadow: '0 0 6px 2px rgba(249, 125, 50, 0.4)', // secondary color glow
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-0.5 h-0.5 bg-blue-300/30 dark:bg-blue-200/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float 15s ease-in-out infinite`,
                animationDelay: `${Math.random() * 15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

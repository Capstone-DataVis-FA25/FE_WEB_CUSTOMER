import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/driver-theme.css';
import App from './App.tsx';
import '@/i18n/i18n';
import { ThemeProvider } from './theme/ThemeProvider';

// AGGRESSIVE SVG ERROR SUPPRESSION - Set up BEFORE anything else
(function suppressSVGErrors() {
  // Override console.error
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const message = args
      .map(a => String(a))
      .join(' ')
      .toLowerCase();
    // Suppress ANY error containing "negative value" and SVG-related terms
    if (
      message.includes('negative value') &&
      (message.includes('rect') ||
        message.includes('attribute') ||
        message.includes('width') ||
        message.includes('height'))
    ) {
      return; // SILENTLY IGNORE
    }
    originalConsoleError.apply(console, args);
  };

  // Override window.onerror
  const originalWindowError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || '').toLowerCase();
    // Suppress ANY error containing "negative value" and SVG-related terms
    if (
      msg.includes('negative value') &&
      (msg.includes('rect') ||
        msg.includes('attribute') ||
        msg.includes('width') ||
        msg.includes('height'))
    ) {
      return true; // PREVENT ERROR FROM SHOWING
    }
    if (originalWindowError) {
      return originalWindowError(message, source, lineno, colno, error);
    }
    return false;
  };

  // Override console.warn too (just in case)
  const originalConsoleWarn = console.warn;
  console.warn = function (...args: any[]) {
    const message = args
      .map(a => String(a))
      .join(' ')
      .toLowerCase();
    if (
      message.includes('negative value') &&
      (message.includes('rect') ||
        message.includes('attribute') ||
        message.includes('width') ||
        message.includes('height'))
    ) {
      return; // SILENTLY IGNORE
    }
    originalConsoleWarn.apply(console, args);
  };
})();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system">
    <App />
  </ThemeProvider>
);

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRouter from './router/AppRouter';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { store, persistor } from './store/store';
// import LoadingSpinner from './components/ui/LoadingSpinner';
import SplashScreen from './pages/splash/SplashScreen';
import { useState, useEffect } from 'react';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [showSplash, setShowSplash] = useState(true);

  // Suppress SVG negative width/height errors globally (from D3 charts)
  useEffect(() => {
    // Suppress console.error for SVG negative value errors
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args
        .map(arg => String(arg))
        .join(' ')
        .toLowerCase();
      // Suppress SVG negative value errors (matches: "Error: <rect> attribute height: A negative value is not valid.")
      if (
        errorMessage.includes('negative value') &&
        (errorMessage.includes('width') || errorMessage.includes('height')) &&
        (errorMessage.includes('<rect>') || errorMessage.includes('attribute'))
      ) {
        return; // Suppress this error
      }
      originalError.apply(console, args);
    };

    // Suppress window.onerror for SVG validation errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const errorMessage = (message?.toString() || '').toLowerCase();
      // Suppress SVG negative value errors
      if (
        errorMessage.includes('negative value') &&
        (errorMessage.includes('width') || errorMessage.includes('height')) &&
        (errorMessage.includes('<rect>') || errorMessage.includes('attribute'))
      ) {
        return true; // Suppress this error
      }
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    return () => {
      console.error = originalError;
      window.onerror = originalOnError;
    };
  }, []);

  // Show splash on every reload. When splash finishes we simply hide it for this session.
  const handleSplashDone = () => {
    setShowSplash(false);
  };

  return (
    <Provider store={store}>
      <PersistGate
        // loading={<LoadingSpinner />}
        persistor={persistor}
      >
        <GoogleOAuthProvider clientId={googleClientId || ''}>
          <ToastProvider>
            {showSplash ? <SplashScreen onDone={handleSplashDone} /> : <AppRouter />}
          </ToastProvider>
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRouter from './router/AppRouter';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { store, persistor } from './store/store';
// import LoadingSpinner from './components/ui/LoadingSpinner';
import SplashScreen from './pages/splash/SplashScreen';
import { useState } from 'react';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [showSplash, setShowSplash] = useState(true);

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

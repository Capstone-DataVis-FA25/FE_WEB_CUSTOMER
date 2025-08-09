import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRouter from './router/AppRouter';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { store, persistor } from './store/store';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <GoogleOAuthProvider clientId={googleClientId || ''}>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;

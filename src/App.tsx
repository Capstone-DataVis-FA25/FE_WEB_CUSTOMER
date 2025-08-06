import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import AppRouter from './router/AppRouter';
import { ToastProvider } from '@/components/providers/ToastProvider';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;

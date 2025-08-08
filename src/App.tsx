import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppRouter from './router/AppRouter';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { store, persistor } from './store/store';

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

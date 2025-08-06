import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { persistStore } from 'redux-persist';
// Import root saga
import rootSaga from './root-saga';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import rootReducer from './root-reducer';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
  devTools: import.meta.env.VITE_APP_ENVIRONMENT !== 'production',
});

// Run the root saga
sagaMiddleware.run(rootSaga);

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Redux hooks with types
export { useSelector, useDispatch } from 'react-redux';
export type { TypedUseSelectorHook } from 'react-redux';

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;

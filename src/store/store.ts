import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import datasetReducer from '../features/dataset/datasetSlice';
import type { AuthState } from '../features/auth/authType';
import type { DatasetState } from '../features/dataset/datasetSlice';
import { chartReducer, type ChartState } from '@/features/charts';
import { chartNoteReducer, type ChartNoteState } from '@/features/chartNotes';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'chartNote'], // Persist auth and chartNote state
};

const rootReducer = combineReducers({
  auth: authReducer,
  dataset: datasetReducer,
  chart: chartReducer,
  chartNote: chartNoteReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = {
  auth: AuthState;
  dataset: DatasetState;
  chart: ChartState;
  chartNote: ChartNoteState;
};

export type AppDispatch = typeof store.dispatch;

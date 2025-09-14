import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import datasetReducer from '../features/dataset/datasetSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Chỉ persist auth state, không persist dataset
};

const rootReducer = combineReducers({
  auth: authReducer,
  dataset: datasetReducer,
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

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// const dispatch = useAppDispatch();

// const result = await dispatch(
//   signInWithEmailAndPassword({
//     email: formData.email,
//     password: formData.password,
//   })
// ).unwrap();

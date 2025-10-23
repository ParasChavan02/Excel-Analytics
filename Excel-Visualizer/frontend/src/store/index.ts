import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import fileSlice from './slices/fileSlice';
import chartSlice from './slices/chartSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    files: fileSlice,
    charts: chartSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['files/uploadFile/pending', 'files/uploadFile/fulfilled'],
        ignoredPaths: ['files.currentUpload'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
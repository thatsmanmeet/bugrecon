import { configureStore } from '@reduxjs/toolkit';
import authSlice from '@/slices/local/AuthSlice.js';
import { apiSlice } from './slices/remote/ApiSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV === 'development',
});

export default store;

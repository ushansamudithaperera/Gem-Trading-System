import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gemReducer from './slices/gemSlice';
import orderReducer from './slices/orderSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gems: gemReducer,
    orders: orderReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optional: Setup initial auth state from sessionStorage token
const token = sessionStorage.getItem('token');
if (token) {
  // You could dispatch a thunk to fetch user here, but we'll do it in App.tsx
}
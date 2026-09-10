import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
import wagerReducer from './wager.slice';
import paymentReducer from './payment.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wager: wagerReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth.slice';
import wagerReducer from './wager.slice';
import paymentReducer from './payment.slice';
import gameReducer from './game.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wager: wagerReducer,
    payment: paymentReducer,
    games: gameReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

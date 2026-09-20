import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Game } from '../types/game.types';

interface GameState {
  list: Game[];
  current: Game | null;
}

const initialState: GameState = {
  list: [],
  current: null,
};

const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setGames: (state, action: PayloadAction<Game[]>) => {
      state.list = action.payload;
    },
    setCurrentGame: (state, action: PayloadAction<Game | null>) => {
      state.current = action.payload;
    },
  },
});
export const { setGames, setCurrentGame } = gameSlice.actions;
export default gameSlice.reducer;

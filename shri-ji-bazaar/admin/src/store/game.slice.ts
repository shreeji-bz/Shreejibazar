import { createSlice } from '@reduxjs/toolkit';
const gameSlice = createSlice({ name: 'games', initialState: { list: [], current: null }, reducers: { setGames: (state, action) => { state.list = action.payload; }, setCurrentGame: (state, action) => { state.current = action.payload; } } });
export const { setGames, setCurrentGame } = gameSlice.actions;
export default gameSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
const roundSlice = createSlice({ name: 'rounds', initialState: { list: [] }, reducers: { setRounds: (state, action) => { state.list = action.payload; } } });
export const { setRounds } = roundSlice.actions;
export default roundSlice.reducer;

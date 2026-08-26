import { createSlice } from '@reduxjs/toolkit';
const resultSlice = createSlice({ name: 'results', initialState: { list: [] }, reducers: { setResults: (state, action) => { state.list = action.payload; } } });
export const { setResults } = resultSlice.actions;
export default resultSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
const userSlice = createSlice({ name: 'users', initialState: { list: [], current: null }, reducers: { setUsers: (state, action) => { state.list = action.payload; }, setCurrentUser: (state, action) => { state.current = action.payload; } } });
export const { setUsers, setCurrentUser } = userSlice.actions;
export default userSlice.reducer;

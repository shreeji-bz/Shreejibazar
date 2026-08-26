import { createSlice } from '@reduxjs/toolkit';
const notificationSlice = createSlice({ name: 'notifications', initialState: { list: [], unread: 0 }, reducers: { setNotifications: (state, action) => { state.list = action.payload; } } });
export const { setNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    unreadTotal: 0,
  },
  reducers: {
    setChatUnreadTotal: (state, action) => {
      state.unreadTotal = action.payload;
    },
  },
});

export const { setChatUnreadTotal } = chatSlice.actions;
export const selectChatUnreadTotal = (state) => state.chat.unreadTotal;

export default chatSlice.reducer;

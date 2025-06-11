import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
};

const authState = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentialsOnLogin: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    removeCredentialsOnLogout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setCredentialsOnLogin, removeCredentialsOnLogout } =
  authState.actions;

export default authState.reducer;

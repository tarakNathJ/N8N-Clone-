
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../utils/localStorage';
import { setView } from './navigationSlice';

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem('auth', JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem('auth');
    },
    setAuthFromLocalStorage(state) {
        try {
            const authUser = localStorage.getItem('auth');
            if(authUser) {
                state.user = JSON.parse(authUser);
            }
        } catch (error) {
            console.error("Failed to parse auth from localStorage", error);
            state.user = null;
        }
    }
  },
});

export const { setUser, logout, setAuthFromLocalStorage } = authSlice.actions;

export const logoutAndRedirect = () => (dispatch: any) => {
    dispatch(logout());
    dispatch(setView({ view: 'landing' }));
};


export default authSlice.reducer;

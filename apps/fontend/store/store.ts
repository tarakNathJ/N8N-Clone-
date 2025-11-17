
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import navigationReducer from './navigationSlice';
import workflowsReducer from './workflowsSlice';
import editorReducer from './editorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    navigation: navigationReducer,
    workflows: workflowsReducer,
    editor: editorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

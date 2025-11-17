
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'editor' | 'workflows';

interface NavigationState {
  view: View;
  currentWorkflowId: string | null;
}

const initialState: NavigationState = {
  view: 'landing',
  currentWorkflowId: null,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setView(state, action: PayloadAction<{ view: View; workflowId?: string }>) {
      state.view = action.payload.view;
      state.currentWorkflowId = action.payload.workflowId || null;
    },
  },
});

export const { setView } = navigationSlice.actions;
export default navigationSlice.reducer;
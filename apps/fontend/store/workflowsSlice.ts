
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workflow } from '../types';
import { getWorkflows, saveWorkflows } from '../utils/localStorage';
import { generateId } from '../utils/id';

interface WorkflowsState {
  workflows: Workflow[];
}

const initialState: WorkflowsState = {
  workflows: [],
};

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    loadWorkflows(state) {
      state.workflows = getWorkflows();
    },
    createWorkflow(state, action: PayloadAction<{ name: string }>) {
      const newWorkflow: Workflow = {
        id: generateId(),
        name: action.payload.name,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        nodes: {},
        edges: [],
      };
      state.workflows.push(newWorkflow);
      saveWorkflows(state.workflows);
    },
    updateWorkflow(state, action: PayloadAction<Workflow>) {
        const index = state.workflows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
            state.workflows[index] = {
                ...action.payload,
                updated: new Date().toISOString(),
            };
            saveWorkflows(state.workflows);
        }
    },
    deleteWorkflow(state, action: PayloadAction<string>) {
        state.workflows = state.workflows.filter(w => w.id !== action.payload);
        saveWorkflows(state.workflows);
    },
    duplicateWorkflow(state, action: PayloadAction<string>) {
        const original = state.workflows.find(w => w.id === action.payload);
        if (original) {
            const newWorkflow: Workflow = {
                ...original,
                id: generateId(),
                name: `${original.name} (Copy)`,
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
            };
            state.workflows.push(newWorkflow);
            saveWorkflows(state.workflows);
        }
    }
  },
});

export const { loadWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, duplicateWorkflow } = workflowsSlice.actions;
export default workflowsSlice.reducer;

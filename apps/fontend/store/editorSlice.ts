
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge, NodeType, Workflow } from '../types';
import { generateId } from '../utils/id';

interface EditorState {
  workflowId: string | null;
  workflowName: string;
  nodes: Record<string, Node>;
  edges: Edge[];
  selectedNodeId: string | null;
  connectMode: { fromNodeId: string } | null;
}

const initialState: EditorState = {
  workflowId: null,
  workflowName: 'Untitled Workflow',
  nodes: {},
  edges: [],
  selectedNodeId: null,
  connectMode: null,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    loadWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.workflowId = action.payload.id;
      state.workflowName = action.payload.name;
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
      state.selectedNodeId = null;
      state.connectMode = null;
    },
    setWorkflowName: (state, action: PayloadAction<string>) => {
      state.workflowName = action.payload;
    },
    addNode: (state, action: PayloadAction<{ type: NodeType; x: number; y: number }>) => {
      const id = generateId();
      state.nodes[id] = {
        id,
        type: action.payload.type,
        x: action.payload.x,
        y: action.payload.y,
        label: `${action.payload.type} Node`,
        data: {},
      };
    },
    updateNode: (state, action: PayloadAction<{ id: string; data: Partial<Node> }>) => {
      if (state.nodes[action.payload.id]) {
        state.nodes[action.payload.id] = {
          ...state.nodes[action.payload.id],
          ...action.payload.data,
        };
      }
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      delete state.nodes[nodeId];
      state.edges = state.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);
      if (state.selectedNodeId === nodeId) {
        state.selectedNodeId = null;
      }
    },
    moveNode: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      if (state.nodes[action.payload.id]) {
        state.nodes[action.payload.id].x = action.payload.x;
        state.nodes[action.payload.id].y = action.payload.y;
      }
    },
    setSelectedNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
      state.connectMode = null; // Exit connect mode when selecting a node or deselecting
    },
    startConnect: (state, action: PayloadAction<string>) => {
      state.connectMode = { fromNodeId: action.payload };
      state.selectedNodeId = null; // Deselect node when starting connection
    },
    completeConnect: (state, action: PayloadAction<string>) => {
      if (state.connectMode) {
        const { fromNodeId } = state.connectMode;
        const toNodeId = action.payload;
        
        // Prevent self-connection and duplicate edges
        const isSelfConnection = fromNodeId === toNodeId;
        const edgeExists = state.edges.some(
          edge => (edge.from === fromNodeId && edge.to === toNodeId)
        );

        if (!isSelfConnection && !edgeExists) {
            const id = generateId();
            state.edges.push({ id, from: fromNodeId, to: toNodeId });
        }
        state.connectMode = null;
      }
    },
    cancelConnect: (state) => {
      state.connectMode = null;
    },
    deleteEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter(edge => edge.id !== action.payload);
    },
  },
});

export const {
  loadWorkflow,
  setWorkflowName,
  addNode,
  updateNode,
  deleteNode,
  moveNode,
  setSelectedNodeId,
  startConnect,
  completeConnect,
  cancelConnect,
  deleteEdge,
} = editorSlice.actions;

export default editorSlice.reducer;

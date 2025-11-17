
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updateWorkflow } from '../store/workflowsSlice';
import { Workflow } from '../types';

export const useAutoSave = () => {
  const dispatch = useDispatch();
  const editorState = useSelector((state: RootState) => state.editor);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!editorState.workflowId) return;

    timeoutRef.current = window.setTimeout(() => {
      const currentWorkflow: Workflow = {
        id: editorState.workflowId!,
        name: editorState.workflowName,
        nodes: editorState.nodes,
        edges: editorState.edges,
        created: '', // Not managed here
        updated: new Date().toISOString(),
      };
      dispatch(updateWorkflow(currentWorkflow));
    }, 1000); // Debounce time

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [editorState.nodes, editorState.edges, editorState.workflowName, editorState.workflowId, dispatch]);
};

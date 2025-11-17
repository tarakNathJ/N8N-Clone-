
export enum NodeType {
  Trigger = 'Trigger',
  HttpRequest = 'HTTP Request',
  Function = 'Function',
  Set = 'Set',
  Delay = 'Delay'
}

export interface NodeData {
  [key: string]: any;
}

export interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  label: string;
  data: NodeData;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
}

export interface Workflow {
  id: string;
  name: string;
  created: string;
  updated: string;
  nodes: Record<string, Node>;
  edges: Edge[];
}

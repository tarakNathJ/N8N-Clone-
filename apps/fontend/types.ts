
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
  metadata?: any;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
}

export interface Workflow {
  // create_at: string | number | Date;
  create_at: any;
  id: string;
  _count: {
    stepes: number;
    stepes_runs: number;
  };
  name: string;
  created: string;
  updated: string;
  nodes: Record<string, Node>;
  edges: Edge[];
}

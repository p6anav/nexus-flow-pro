import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { Connection, Edge, Node, EdgeChange, NodeChange } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import type { JsonValue, WorkflowNodeData } from '../types/workflow';

interface CanvasState {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  selectedNode: Node<WorkflowNodeData> | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, label: string, config: Record<string, JsonValue>, position: { x: number; y: number }) => void;
  updateNodeConfig: (id: string, newConfig: Record<string, JsonValue>) => void;
  updateNodeLabel: (id: string, newLabel: string) => void;
  importNodesFromJson: (jsonString: string) => boolean;
  setSelectedNode: (node: Node<WorkflowNodeData> | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  onConnect: (connection) => set((state) => ({ edges: [...state.edges, { ...connection, id: uuidv4() } as Edge] })),
  addNode: (type, label, config, position) => {
    const newNode: Node<WorkflowNodeData> = {
      id: uuidv4(),
      type: 'genericNode',
      position,
      data: { label, type, config },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },
  updateNodeConfig: (id, newConfig) => set((state) => {
    const updatedNodes = state.nodes.map((node) => 
      node.id === id ? { ...node, data: { ...node.data, config: newConfig } } : node
    );
    const updatedSelected = state.selectedNode?.id === id 
      ? { ...state.selectedNode, data: { ...state.selectedNode.data, config: newConfig } }
      : state.selectedNode;
    return { nodes: updatedNodes, selectedNode: updatedSelected };
  }),
  updateNodeLabel: (id, newLabel) => set((state) => {
    const updatedNodes = state.nodes.map((node) => 
      node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
    );
    const updatedSelected = state.selectedNode?.id === id 
      ? { ...state.selectedNode, data: { ...state.selectedNode.data, label: newLabel } }
      : state.selectedNode;
    return { nodes: updatedNodes, selectedNode: updatedSelected };
  }),
  importNodesFromJson: (jsonString: string) => {
    try {
      if (!jsonString || !jsonString.trim()) {
        alert('Import Error: The file or text content is empty.');
        return false;
      }

      const parsedData: unknown = JSON.parse(jsonString);
      if (!parsedData || typeof parsedData !== 'object') {
        alert('Invalid JSON format: Expected an array of nodes or an object with a "nodes" property.');
        return false;
      }
      const importedData = parsedData as { nodes?: unknown };
      const nodesArray = Array.isArray(parsedData) ? parsedData : importedData.nodes;

      if (!Array.isArray(nodesArray)) {
        alert('Invalid JSON format: Expected an array of nodes or an object with a "nodes" property.');
        return false;
      }

      const newNodes: Node<WorkflowNodeData>[] = nodesArray.map((item, index) => {
        if (!item || typeof item !== 'object') {
          throw new Error(`Node at index ${index} must be an object.`);
        }
        const node = item as Record<string, unknown>;
        const data = node.data && typeof node.data === 'object'
          ? node.data as Record<string, unknown>
          : {};
        const config = node.config ?? data.config ?? {};
        if (!config || typeof config !== 'object' || Array.isArray(config)) {
          throw new Error(`Node configuration at index ${index} must be an object.`);
        }
        const position = node.position && typeof node.position === 'object'
          ? node.position as { x: number; y: number }
          : { x: 100 + (index * 220), y: 150 };

        return {
          id: typeof node.id === 'string' ? node.id : uuidv4(),
          type: 'genericNode',
          position,
          data: {
            label: typeof node.label === 'string'
              ? node.label
              : typeof data.label === 'string' ? data.label : 'Imported Node',
            type: typeof node.type === 'string'
              ? node.type
              : typeof data.type === 'string' ? data.type : 'default',
            config: config as Record<string, JsonValue>,
          },
        };
      });

      set((state) => ({
        nodes: [...state.nodes, ...newNodes],
      }));

      alert(`Successfully created ${newNodes.length} node(s) from JSON!`);
      return true;
    } catch (err) {
      console.error('Failed to parse workflow JSON', err);
      alert('Error parsing JSON. Please check your syntax.');
      return false;
    }
  },
  setSelectedNode: (node) => set({ selectedNode: node }),
}));
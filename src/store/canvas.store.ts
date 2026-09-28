import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import type { Connection, Edge, Node, EdgeChange, NodeChange } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, label: string, config: Record<string, any>, position: { x: number; y: number }) => void;
  updateNodeConfig: (id: string, newConfig: Record<string, any>) => void;
  updateNodeLabel: (id: string, newLabel: string) => void;
  importNodesFromJson: (jsonString: string) => boolean; // Added interface signature
  setSelectedNode: (node: Node | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  onNodesChange: (changes) => set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) => set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  onConnect: (connection) => set((state) => ({ edges: [...state.edges, { ...connection, id: uuidv4() } as Edge] })),
  addNode: (type, label, config, position) => {
    const newNode: Node = {
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

      const parsedData = JSON.parse(jsonString);
      const nodesArray = Array.isArray(parsedData) ? parsedData : parsedData.nodes;

      if (!Array.isArray(nodesArray)) {
        alert('Invalid JSON format: Expected an array of nodes or an object with a "nodes" property.');
        return false;
      }

      const newNodes: Node[] = nodesArray.map((item, index) => ({
        id: item.id || uuidv4(),
        type: 'genericNode',
        position: item.position || { x: 100 + (index * 220), y: 150 },
        data: {
          label: item.label || item.data?.label || 'Imported Node',
          type: item.type || item.data?.type || 'default',
          config: item.config || item.data?.config || {},
        },
      }));

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
import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  BackgroundVariant 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvasStore } from '../../../store/canvas.store';
import { GenericNode } from '../../../features/canvas/nodes/GenericNode';

export const CanvasWorkspace = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode } = useCanvasStore();
  
  // Strict constraint compliance: Map all nodes to a single generic component
  const nodeTypes = useMemo(() => ({ genericNode: GenericNode }), []);

  // Allow items to be dragged over the canvas workspace
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle dropping a template from the left sidebar onto the canvas graph
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      try {
        const item = JSON.parse(rawData);
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        
        // Compute exact drop coordinates relative to the canvas viewport
        const position = {
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        };

        // Create a new unique node instance via the Zustand store
        addNode(item.type, item.title, item.config || {}, position);
      } catch (err) {
        console.error('Failed to parse dropped template data', err);
      }
    },
    [addNode]
  );

  // Deselect node when clicking on empty canvas space
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div 
      className="w-full h-full relative" 
      onDragOver={onDragOver} 
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap style={{ height: 120 }} zoomable pannable />
      </ReactFlow>
    </div>
  );
};
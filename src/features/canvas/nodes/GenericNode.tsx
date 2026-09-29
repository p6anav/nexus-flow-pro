import { memo } from 'react';
import type { MouseEvent } from 'react';
import { Handle, Position } from 'reactflow';
import { useCanvasStore } from '../../../store/canvas.store';
import type { WorkflowNodeData } from '../../../types/workflow';

interface CustomNodeProps {
  id: string;
  data: WorkflowNodeData;
  selected?: boolean;
}

export const GenericNode = memo(({ id, data }: CustomNodeProps) => {
  const setSelectedNode = useCanvasStore((state) => state.setSelectedNode);
  const nodes = useCanvasStore((state) => state.nodes);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    const currentNode = nodes.find((n) => n.id === id);
    if (currentNode) setSelectedNode(currentNode);
  };

  return (
    <div 
      onClick={handleClick} 
      className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm w-64 cursor-pointer hover:border-blue-500 transition-all select-none"
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      
      <div className="flex items-center justify-between mb-1">
        <div className="font-semibold text-slate-800 text-xs">{data?.label || 'Node'}</div>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-600 uppercase">
          {data?.type || 'custom'}
        </span>
      </div>
      
      {/* Dynamic configuration properties preview */}
      <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg text-xs mt-3 border border-slate-100">
        {(!data?.config || Object.keys(data.config).length === 0) ? (
          <div className="text-slate-400 italic text-[11px]">No configuration set</div>
        ) : (
          Object.entries(data.config).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-medium capitalize">{key}:</span>
              <span className="text-slate-700 font-mono truncate max-w-[130px]">{String(value)}</span>
            </div>
          ))
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
  );
});

GenericNode.displayName = 'GenericNode';
import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../../store/canvas.store';
import { useWorkflowStore } from '../../../store/workflow.store';

export const EditorPanel = () => {
  const { selectedNode, updateNodeConfig, updateNodeLabel, setSelectedNode } = useCanvasStore();
  const { saveAsTemplate } = useWorkflowStore();

  const [label, setLabel] = useState('');
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
      setConfig(selectedNode.data.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="w-80 border-l border-slate-200 bg-white p-4 text-xs text-slate-400 flex items-center justify-center">
        Select a node on the canvas to edit its properties
      </div>
    );
  }

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    updateNodeLabel(selectedNode.id, newLabel);
  };

  const handleConfigChange = (key: string, value: any) => {
    const updatedConfig = { ...config, [key]: value };
    setConfig(updatedConfig);
    updateNodeConfig(selectedNode.id, updatedConfig);
  };

  const handleSaveTemplate = () => {
    if (!label.trim()) {
      alert('Validation Error: Node label cannot be empty.');
      return;
    }

    const hasEmptyKeys = Object.keys(config).some((key) => !key.trim());
    if (hasEmptyKeys) {
      alert('Validation Error: All configuration keys must have valid names.');
      return;
    }

    saveAsTemplate({
      type: selectedNode.data.type,
      label,
      config,
    });
    alert('Node validated and saved as a versioned template successfully!');
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-[calc(100vh-3.5rem)] select-none">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <span className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Node Inspector</span>
        <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div>
          <label className="block font-medium text-slate-500 mb-1">Node Type</label>
          <input type="text" disabled value={selectedNode.data.type} className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-slate-500 cursor-not-allowed" />
        </div>

        <div>
          <label className="block font-medium text-slate-500 mb-1">Display Label</label>
          <input 
            type="text" 
            value={label} 
            onChange={(e) => handleLabelChange(e.target.value)} 
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-blue-500" 
          />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <div className="font-semibold text-slate-700 mb-2">Configuration Parameters</div>
          {Object.keys(config).length === 0 ? (
            <div className="text-slate-400 italic">No configuration properties</div>
          ) : (
            Object.entries(config).map(([key, value]) => (
              <div key={key} className="mb-3">
                <label className="block font-medium text-slate-500 mb-1 capitalize">{key}</label>
                <input 
                  type="text" 
                  value={String(value)} 
                  onChange={(e) => handleConfigChange(key, e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-blue-500" 
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button 
          onClick={handleSaveTemplate}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs shadow-sm transition-all"
        >
          Save as Template
        </button>
      </div>
    </div>
  );
};
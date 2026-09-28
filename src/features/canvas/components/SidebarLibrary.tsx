import React, { useState } from 'react';
import { useWorkflowStore } from '../../../store/workflow.store';
export const SidebarLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { templates, deleteTemplate, exportTemplates, importTemplates } = useWorkflowStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) importTemplates(content);
    };
    reader.readAsText(file);
  };
  const filteredTemplates = templates.filter(t => 
    t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Template Library</span>
          <div className="flex gap-2">
            <button 
              onClick={exportTemplates} 
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium transition-all"
              title="Export Templates as JSON"
            >
              Export
            </button>
            <label className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium cursor-pointer transition-all">
              Import
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
        <input 
          type="text" 
          placeholder="Search saved templates..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-[10px] font-semibold text-slate-400 uppercase">Drag templates onto canvas</div>
       {filteredTemplates.map((item) => (
  <div 
    key={item.id}
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData(
        'application/reactflow', 
        JSON.stringify({ type: item.type, title: item.label, config: item.config })
      );
      e.dataTransfer.effectAllowed = 'move';
    }}
    className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-blue-400 group relative"
  >
    <div className="flex items-center justify-between mb-1">
      <span className="font-medium text-slate-800 text-xs group-hover:text-blue-600">{item.label}</span>
      <div className="flex items-center gap-1.5">
  {item.isReadOnly && (
    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">System</span>
  )}
  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-50 text-blue-600 font-semibold">
    v{item.version || 1}
  </span>
</div>
    </div>
    <div className="text-[11px] text-slate-400 uppercase tracking-wider">{item.type}</div>
    
    {/* Only allow deleting non-read-only custom templates */}
    {!item.isReadOnly && (
      <button 
        onClick={(e) => { e.stopPropagation(); deleteTemplate(item.id); }}
        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        title="Delete template"
      >
        ✕
      </button>
    )}
  </div>
))}
      </div>
    </aside>
  );
};
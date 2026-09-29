import React, { useState } from 'react';
import { useCanvasStore } from '../../../store/canvas.store';

interface JsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JsonImportModal: React.FC<JsonImportModalProps> = ({ isOpen, onClose }) => {
  const [jsonInput, setJsonInput] = useState('');
  const { importNodesFromJson } = useCanvasStore() as unknown as ReturnType<typeof useCanvasStore> & {
    importNodesFromJson: (json: string) => boolean;
  };

  if (!isOpen) return null;

  const handleImport = () => {
    const success = importNodesFromJson(jsonInput);
    if (success) {
      setJsonInput('');
      onClose();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Promise-based file reading works reliably across mobile & desktop
      const content = await file.text();
      
      if (content) {
        const success = importNodesFromJson(content);
        if (success) {
          setJsonInput('');
          onClose();
        }
      }
    } catch (err) {
      console.error('Mobile file read error:', err);
      alert('Failed to read file on mobile device. Please try pasting the JSON directly.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs select-none p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 text-sm">Import Nodes from JSON</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>
        
        <p className="text-xs text-slate-500 mb-3">
          Upload a local JSON file or paste your node configuration below to generate nodes dynamically on the canvas.
        </p>

        {/* Mobile-Friendly File Upload Input */}
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Upload JSON File (Mobile Friendly)</label>
          <input 
            type="file" 
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg p-1"
          />
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Or Paste JSON</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <textarea 
          rows={6}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`[\n  {\n    "type": "webhook",\n    "label": "API Webhook",\n    "config": { "endpoint": "/api/v1" },\n    "position": { "x": 100, "y": 100 }\n  }\n]`}
          className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 mb-4 resize-none"
        />

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleImport}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            Parse & Create Nodes
          </button>
        </div>
      </div>
    </div>
  );
};
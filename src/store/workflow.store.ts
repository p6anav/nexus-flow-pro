import { create } from 'zustand';

export interface WorkflowTemplate {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  version: number;
  isReadOnly?: boolean;
}

interface WorkflowState {
  templates: WorkflowTemplate[];
  saveAsTemplate: (nodeData: { type: string; label: string; config: Record<string, any> }) => void;
  deleteTemplate: (id: string) => void;
  exportTemplates: () => void;
  importTemplates: (fileContent: string) => void;
}

// Load templates from localStorage safely on startup
const getInitialTemplates = (): WorkflowTemplate[] => {
  try {
    const saved = localStorage.getItem('nexusflow_templates');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load templates from localStorage', err);
  }
  
  // Default system templates marked as read-only
  return [
    { id: 'tpl-1', type: 'webhook', label: 'Webhook Listener', config: { endpoint: '/webhook', method: 'POST' }, version: 1, isReadOnly: true },
    { id: 'tpl-2', type: 'ai', label: 'AI Transform', config: { model: 'gpt-4o', temperature: 0.7 }, version: 1, isReadOnly: true }
  ];
};
export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  templates: getInitialTemplates(),

 saveAsTemplate: (nodeData) => set((state) => {
    // Check if an editable template with the exact same type already exists
    const existingIndex = state.templates.findIndex(
      (t) => t.type === nodeData.type && !t.isReadOnly
    );

    let updatedTemplates = [...state.templates];

    if (existingIndex >= 0) {
      // Increment version on existing custom template update
      const existing = updatedTemplates[existingIndex];
      updatedTemplates[existingIndex] = {
        ...existing,
        label: nodeData.label,
        config: nodeData.config,
        version: (existing.version || 1) + 1,
      };
    } else {
      // Create a brand new version 1 template
      const newTemplate: WorkflowTemplate = {
        id: crypto.randomUUID(),
        type: nodeData.type,
        label: nodeData.label,
        config: nodeData.config,
        version: 1,
        isReadOnly: false,
      };
      updatedTemplates.push(newTemplate);
    }

    localStorage.setItem('nexusflow_templates', JSON.stringify(updatedTemplates));
    return { templates: updatedTemplates };
  }),

  deleteTemplate: (id) => set((state) => {
    const target = state.templates.find(t => t.id === id);
    if (target?.isReadOnly) {
      alert('Cannot delete read-only system templates.');
      return state;
    }
    const updatedTemplates = state.templates.filter((t) => t.id !== id);
    localStorage.setItem('nexusflow_templates', JSON.stringify(updatedTemplates));
    return { templates: updatedTemplates };
  }),
  // Export templates as a downloadable JSON file
  exportTemplates: () => {
    const state = get();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.templates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexusflow_templates_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Import templates from an uploaded JSON file
  importTemplates: (fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed)) {
        set((state) => {
          // Merge imported templates, avoiding duplicate IDs
          const existingIds = new Set(state.templates.map(t => t.id));
          const newTemplates = parsed.filter(t => !existingIds.has(t.id));
          const updated = [...state.templates, ...newTemplates];
          
          localStorage.setItem('nexusflow_templates', JSON.stringify(updated));
          return { templates: updated };
        });
        alert('Templates imported successfully!');
      } else {
        alert('Invalid template file format.');
      }
    } catch (err) {
      console.error('Failed to parse imported JSON', err);
      alert('Error parsing JSON file.');
    }
  }
}));
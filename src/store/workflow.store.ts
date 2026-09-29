import { create } from 'zustand';
import type { JsonValue, WorkflowTemplate } from '../types/workflow';

interface WorkflowState {
  templates: WorkflowTemplate[];
  saveAsTemplate: (nodeData: {
    type: string;
    label: string;
    config: Record<string, JsonValue>;
  }) => void;
  deleteTemplate: (id: string) => void;
  exportTemplates: () => void;
  importTemplates: (fileContent: string) => void;
}

const STORAGE_KEY = 'nexusflow_templates';

const defaultTemplates: WorkflowTemplate[] = [
  {
    id: 'tpl-1',
    type: 'webhook',
    label: 'Webhook Listener',
    config: { endpoint: '/webhook', method: 'POST' },
    version: 1,
    isReadOnly: true,
  },
  {
    id: 'tpl-2',
    type: 'ai',
    label: 'AI Transform',
    config: { model: 'gpt-4o', temperature: 0.7 },
    version: 1,
    isReadOnly: true,
  },
];

const isTemplate = (value: unknown): value is WorkflowTemplate => {
  if (!value || typeof value !== 'object') return false;
  const template = value as Partial<WorkflowTemplate>;
  return typeof template.id === 'string'
    && typeof template.type === 'string'
    && typeof template.label === 'string'
    && typeof template.version === 'number'
    && Boolean(template.config)
    && typeof template.config === 'object'
    && !Array.isArray(template.config);
};

const getInitialTemplates = (): WorkflowTemplate[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.every(isTemplate)) return parsed;
      console.error(`Saved templates in ${STORAGE_KEY} have an invalid format.`);
    }
  } catch (error) {
    console.error('Failed to load templates from localStorage', error);
  }

  return defaultTemplates;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  templates: getInitialTemplates(),

  saveAsTemplate: (nodeData) => set((state) => {
    const existingIndex = state.templates.findIndex(
      (template) => template.type === nodeData.type && !template.isReadOnly,
    );
    const updatedTemplates = [...state.templates];

    if (existingIndex >= 0) {
      const existing = updatedTemplates[existingIndex];
      updatedTemplates[existingIndex] = {
        ...existing,
        label: nodeData.label,
        config: nodeData.config,
        version: existing.version + 1,
      };
    } else {
      updatedTemplates.push({
        id: crypto.randomUUID(),
        type: nodeData.type,
        label: nodeData.label,
        config: nodeData.config,
        version: 1,
        isReadOnly: false,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    return { templates: updatedTemplates };
  }),

  deleteTemplate: (id) => set((state) => {
    const target = state.templates.find((template) => template.id === id);
    if (target?.isReadOnly) {
      alert('Cannot delete read-only system templates.');
      return state;
    }
    const updatedTemplates = state.templates.filter((template) => template.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    return { templates: updatedTemplates };
  }),

  exportTemplates: () => {
    const data = JSON.stringify(get().templates, null, 2);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
    downloadAnchor.download = `nexusflow_templates_${Date.now()}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importTemplates: (fileContent) => {
    try {
      const parsed: unknown = JSON.parse(fileContent);
      if (!Array.isArray(parsed) || !parsed.every(isTemplate)) {
        alert('Invalid template file format.');
        return;
      }

      set((state) => {
        const existingIds = new Set(state.templates.map((template) => template.id));
        const newTemplates = parsed.filter(
          (template: WorkflowTemplate) => !existingIds.has(template.id),
        );
        const updatedTemplates = [...state.templates, ...newTemplates];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
        return { templates: updatedTemplates };
      });
      alert('Templates imported successfully!');
    } catch (error) {
      console.error('Failed to parse imported JSON', error);
      alert('Error parsing JSON file.');
    }
  },
}));

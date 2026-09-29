export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface WorkflowNodeData {
  label: string;
  type: string;
  config: Record<string, JsonValue>;
}

export interface WorkflowTemplate {
  id: string;
  type: string;
  label: string;
  config: Record<string, JsonValue>;
  version: number;
  isReadOnly?: boolean;
}

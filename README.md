# NexusFlow

NexusFlow is a small ReactFlow-based workflow editor for creating configurable nodes, editing their properties, and saving reusable node templates in the browser.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL after the development server starts.

## Use the editor

- **Create nodes:** Select **Import JSON** and paste a node array or an object with a `nodes` array. You can also upload a JSON file.
- **Edit nodes:** Select a node on the canvas. The inspector edits the label and each configuration value directly in the graph.
- **Save templates:** Select **Save as Template** in the inspector. Templates are listed in the library and can be dragged onto the canvas.
- **Share templates:** Use **Export** to download template JSON or **Import** to add templates from a JSON file.

All user-defined workflow types use the same generic ReactFlow renderer. The imported `type` value is node data, not a hardcoded ReactFlow component type.

### Node import format

Provide either an array or an object containing a `nodes` array. `position` is optional; nodes without one are laid out in a row.

```json
[
  {
    "type": "webhook",
    "label": "API Webhook",
    "config": {
      "endpoint": "/api/v1",
      "method": "POST"
    },
    "position": { "x": 100, "y": 100 }
  }
]
```

An existing graph node shape is also accepted: node values may be inside a `data` object instead of at the top level.

## Template persistence and format

Templates are persisted in browser `localStorage` under the key `nexusflow_templates`. The stored value is a JSON array. Each template is a serializable object with this shape:

```json
{
  "id": "stable-template-id",
  "type": "webhook",
  "label": "API Webhook",
  "config": {
    "endpoint": "/api/v1",
    "method": "POST"
  },
  "version": 1,
  "isReadOnly": false
}
```

- `id` identifies the template; each canvas instance gets its own generated node ID.
- `type`, `label`, and `config` are the defaults copied into a new node instance.
- Saving another template with the same editable `type` updates that template and increments its version.
- The built-in Webhook Listener and AI Transform templates are read-only.
- Imported templates are merged by ID; templates whose IDs already exist are skipped.
- Exported template files contain the same JSON array used for storage.

Only templates persist between page reloads. Canvas nodes and edges are held in in-memory graph state and are not restored after a reload.

## Checks

```bash
npm run build
npm run lint
```

There is currently no automated test script in `package.json`.

## Implementation overview

- `src/store/canvas.store.ts` owns ReactFlow nodes, edges, editing, and JSON node creation.
- `src/store/workflow.store.ts` owns template state, localStorage persistence, and template import/export.
- `src/features/canvas/nodes/GenericNode.tsx` renders configurable node data without one component per node type.
- `src/features/canvas/components/EditorPanel.tsx` edits the selected node.
- `src/features/canvas/components/SidebarLibrary.tsx` lists and reuses saved templates.

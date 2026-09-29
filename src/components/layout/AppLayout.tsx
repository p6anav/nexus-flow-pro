import { useState } from 'react';
import { Header } from './Header';
import { useCanvasStore } from '../../store/canvas.store';
import { SidebarLibrary } from '../../features/canvas/components/SidebarLibrary';
import { CanvasWorkspace } from '../../features/canvas/components/Canvas';
import { EditorPanel } from '../../features/canvas/components/EditorPanel';

export const AppLayout = () => {
  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);
  const { selectedNode } = useCanvasStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white font-sans">
      <Header />

     {/* Mobile Control Bar for Toggling Drawers */}
      <div className="lg:hidden flex items-center justify-between bg-slate-50 border-b border-slate-200 px-4 py-2 z-20">
        <button 
          onClick={() => setIsMobileLibraryOpen(!isMobileLibraryOpen)}
          className="text-xs font-medium bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
        >
          {isMobileLibraryOpen ? '✕ Close Library' : '📂 Open Library'}
        </button>
        <span className="text-xs font-semibold text-slate-500">
          {selectedNode ? 'Node Selected' : 'Canvas Workspace'}
        </span>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Sidebar: Library (Slide-over on mobile, fixed column on desktop) */}
       <div className={`
  absolute lg:relative z-30 inset-y-0 left-0 bg-white transition-transform duration-300 ease-in-out h-full
  ${isMobileLibraryOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
  w-80 flex-shrink-0 border-r border-slate-200
`}>
  <SidebarLibrary />
</div>
   {/* Center: Canvas Workspace (Takes 100% available space) */}
        <main className="flex-1 h-full relative bg-slate-50 overflow-hidden">
          <CanvasWorkspace />
        </main>
      {/* Right Sidebar: Editor Panel (Shown as overlay if a node is selected on mobile, or fixed column on desktop) */}
        <div className={`
          absolute lg:relative z-30 inset-y-0 right-0 bg-white transition-transform duration-300 ease-in-out h-full
          ${selectedNode ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
          w-80 flex-shrink-0 border-l border-slate-200
        `}>
          <EditorPanel />
        </div>
        

      </div>
    </div>
  );
};
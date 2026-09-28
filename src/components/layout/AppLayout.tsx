import React, { useState } from 'react';
import { Header } from './Header';
import { useCanvasStore } from '../../store/canvas.store';

export const AppLayout = () => {
  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);
  const { selectedNode } = useCanvasStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white font-sans">
      <Header />

     

      <div className="flex flex-1 relative overflow-hidden">
        

      </div>
    </div>
  );
};
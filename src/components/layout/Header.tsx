import React, { useState } from 'react';


export const Header = () => {
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-3 sm:px-4 flex items-center justify-between z-40 select-none">
      
      {/* Left: Branding & Pipeline Title */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xs sm:text-sm">NF</div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className="font-semibold text-slate-800 text-xs sm:text-sm">NexusFlow</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-600 font-medium text-xs hidden sm:inline">Production</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-mono hidden md:inline">v1.4</span>
          <span className="text-emerald-600 text-[10px] sm:text-xs hidden lg:flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Auto-saved
          </span>
        </div>
      </div>

      {/* Center: Navigation Context Tabs (Hidden on small mobile screens) */}
      

      {/* Right: Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        
        <button 
          onClick={() => setIsJsonModalOpen(true)}
          className="text-xs text-white bg-blue-600 hover:bg-blue-700 text-slate-700 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all"
          title="Import JSON to Canvas"
        >
          <span className="hidden sm:inline">Import JSON</span>
          <span className="sm:hidden">Import</span>
        </button>

       
      </div>
    </header>
  );
};
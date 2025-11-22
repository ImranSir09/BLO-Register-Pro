import React from 'react';

// FIX: Add ThinkingLoader component for use in AIAssistant page.
export const ThinkingLoader: React.FC = () => (
  <div className="flex items-center space-x-1.5">
    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.1s]"></div>
    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
  </div>
);

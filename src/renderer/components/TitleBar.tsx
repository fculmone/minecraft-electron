import React from 'react';

export default function TitleBar() {
  const handleMinimize = () => {
    window.electron.window.minimize();
  };

  const handleMaximize = () => {
    window.electron.window.maximize();
  };

  const handleClose = () => {
    window.electron.window.close();
  };

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center h-10 bg-base-100 border-b border-base-300 select-none drag-region z-50 shadow-sm">
      <div className="flex items-center px-4">
        <span className="text-sm font-semibold text-base-content">
          Minecraft Server Manager
        </span>
      </div>
      <div className="flex">
        <button
          onClick={handleMinimize}
          className="w-12 h-10 flex items-center justify-center hover:bg-base-200 transition-colors no-drag group"
          title="Minimize"
        >
          <svg
            className="w-4 h-4 text-base-content"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="w-12 h-10 flex items-center justify-center hover:bg-base-200 transition-colors no-drag group"
          title="Maximize"
        >
          <svg
            className="w-3.5 h-3.5 text-base-content"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="w-12 h-10 flex items-center justify-center hover:bg-error hover:text-error-content transition-colors no-drag group"
          title="Close"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

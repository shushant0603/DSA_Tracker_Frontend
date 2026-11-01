import React, { useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

const Whiteboard = ({ initialData, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
        <div>
          <p className="font-semibold text-gray-100">Visualization</p>
          <p className="text-xs text-gray-400">Draw arrays, trees, graphs and algorithm flows.</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary text-xs">
          Edit in Excalidraw
        </button>
      </div>
      <div className="h-56 bg-[#101827] flex items-center justify-center">
        <span className="text-sm text-gray-500">
          {initialData?.elements?.length ? `${initialData.elements.length} drawing elements saved` : 'No drawing yet'}
        </span>
      </div>
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/70 p-4">
          <div className="h-full rounded-xl overflow-hidden bg-white relative">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 btn-secondary">
              Close
            </button>
            <Excalidraw
              initialData={initialData || undefined}
              onChange={(elements, appState, files) => onChange({ elements, appState, files })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Whiteboard;

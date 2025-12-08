import React, { useRef } from 'react';
import JavaServerTable, { JavaServerTableRef } from './JavaServerTable';
import { MinecraftServerAPI } from '../../../preload';

declare global {
  interface Window {
    mc: MinecraftServerAPI;
  }
}

export default function ServersView() {
  const tableRef = useRef<JavaServerTableRef>(null);

  const handleImport = async () => {
    await window.mc.importServers();
    // Refresh the table without reloading the page
    if (tableRef.current) {
      await tableRef.current.refresh();
    }
  };

  return (
    <div className="card bg-base-100 p-3">
      <h2 className="text-lg font-bold">Java Servers</h2>
      <button
        className="btn btn-success text-base-200 btn-sm w-fit"
        onClick={handleImport}
      >
        + New Server
      </button>
      <JavaServerTable ref={tableRef} />
    </div>
  );
}

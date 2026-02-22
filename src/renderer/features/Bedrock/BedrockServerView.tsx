import React, { useRef } from 'react';
import BedrockServerTable, {
  BedrockServerTableRef,
} from './ui/BedrockServerTable';

export default function BedrockServerView() {
  const tableRef = useRef<BedrockServerTableRef>(null);

  const handleImport = async () => {
    await window.bedrock.importServers();
    if (tableRef.current) {
      await tableRef.current.refresh();
    }
  };

  return (
    <div className="card bg-base-100 p-3">
      <h2 className="text-lg font-bold">Bedrock Servers</h2>
      <button
        className="btn btn-success text-base-200 btn-sm w-fit"
        onClick={handleImport}
      >
        + New Bedrock Server
      </button>
      <BedrockServerTable ref={tableRef} />
    </div>
  );
}

import { BedrockServer, BedrockServerAPI } from '@renderer/preload';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaPlay, FaStop } from 'react-icons/fa';

declare global {
  interface Window {
    bedrock: BedrockServerAPI;
  }
}

export interface BedrockServerTableRef {
  refresh: () => Promise<void>;
}

const BedrockServerTable = forwardRef<BedrockServerTableRef>((_props, ref) => {
  const navigate = useNavigate();
  const [servers, setServers] = useState<BedrockServer[]>([]);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [listenersRegistered, setListenersRegistered] = useState(false);

  useEffect(() => {
    if (!listenersRegistered) {
      window.bedrock.onStatus((d) => {
        setStatus((prev) => ({ ...prev, [d.id]: d.status }));
      });
      setListenersRegistered(true);
    }

    async function initialize() {
      await refresh();
      const runningStatus = await window.bedrock.getRunningStatus();
      setStatus((prev) => {
        const updated = { ...prev };
        for (const [id, isRunning] of Object.entries(runningStatus)) {
          if (isRunning && (!updated[id] || updated[id] === 'idle')) {
            updated[id] = 'running';
          }
        }
        return updated;
      });
    }

    initialize();
  }, [listenersRegistered]);

  async function refresh() {
    setServers(await window.bedrock.listServers());
  }

  useImperativeHandle(ref, () => ({
    refresh,
  }));

  const handleStart = (server: BedrockServer) => {
    window.bedrock.start(server.id, {
      port: server.port || 19132,
      portV6: server.portV6 || 19133,
    });
  };

  const handleStop = (serverId: string) => {
    window.bedrock.stop(serverId);
  };

  const handleEdit = (serverId: string) => {
    navigate(`/bedrock/edit/${serverId}`);
  };

  return (
    <div className="overflow-x-auto border-[1px] border-base-300 rounded-lg mt-4">
      <table className="table">
        <thead className="bg-accent/15">
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Status</th>
            <th>Port</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {servers.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-base-content/50">
                No Bedrock servers found. Import a ZIP to get started.
              </td>
            </tr>
          ) : (
            servers.map((server) => {
              const serverStatus = status[server.id] || 'idle';
              const isRunning =
                serverStatus === 'running' ||
                serverStatus === 'ready' ||
                serverStatus === 'starting';

              return (
                <tr key={server.id}>
                  <td>{server.name}</td>
                  <td>{server.versionGuess || 'Unknown'}</td>
                  <td>
                    <span
                      className={`badge ${isRunning ? 'badge-success bg-opacity-30' : 'badge-ghost'} min-w-20`}
                    >
                      {serverStatus}
                    </span>
                  </td>
                  <td>{server.port || 19132}</td>
                  <td>
                    <div className="flex gap-2">
                      {isRunning ? (
                        <button
                          className="btn btn-error btn-square btn-sm"
                          onClick={() => handleStop(server.id)}
                          title="Stop Server"
                        >
                          <FaStop className="size-3 text-base-200" />
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-square btn-sm"
                          onClick={() => handleStart(server)}
                          title="Start Server"
                        >
                          <FaPlay className="size-3 text-base-200" />
                        </button>
                      )}
                      <button
                        className="btn btn-info btn-square btn-sm"
                        onClick={() => handleEdit(server.id)}
                        title="Edit Server"
                      >
                        <FaEdit className="size-3 text-base-200" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});

BedrockServerTable.displayName = 'BedrockServerTable';

export default BedrockServerTable;

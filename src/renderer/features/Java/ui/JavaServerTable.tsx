import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaPlay } from 'react-icons/fa';
import { FaStop } from 'react-icons/fa';
import { MinecraftServerAPI } from '../../../preload';
import { McServer } from '@main/minecraftServers/java';

declare global {
  interface Window {
    mc: MinecraftServerAPI;
  }
}

export interface JavaServerTableRef {
  refresh: () => Promise<void>;
}

const JavaServerTable = forwardRef<JavaServerTableRef>((props, ref) => {
  const navigate = useNavigate();
  const [servers, setServers] = useState<McServer[]>([]);
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<Record<string, string>>({});
  const [lastStartedTimes, setLastStartedTimes] = useState<
    Record<string, string>
  >({});
  const [listenersRegistered, setListenersRegistered] = useState(false);

  useEffect(() => {
    // Only register listeners once
    if (!listenersRegistered) {
      window.mc.onLog((d: any) => {
        setLogs((prev) => {
          const next = { ...prev };
          const arr = next[d.id] || [];
          arr.push(`${d.stream === 'stderr' ? '[err] ' : ''}${d.line}`);
          next[d.id] = arr.slice(-2000);
          return next;
        });
      });
      window.mc.onStatus((d: any) => {
        setStatus((prev) => ({ ...prev, [d.id]: d.status }));

        // Update lastStartedAt immediately when server starts
        if (d.status === 'starting') {
          setLastStartedTimes((prev) => ({
            ...prev,
            [d.id]: new Date().toISOString(),
          }));
          // Also refresh the server list to get the persisted value
          refresh();
        }
      });
      setListenersRegistered(true);
    }

    // Load servers and restore running status
    async function initialize() {
      await refresh();
      // Get the current running status from backend
      const runningStatus = await window.mc.getRunningStatus();
      setStatus((prev) => {
        const updated = { ...prev };
        for (const [id, isRunning] of Object.entries(runningStatus)) {
          if (isRunning) {
            // Only set to 'running' if we don't already have a more specific status
            if (!updated[id] || updated[id] === 'idle') {
              updated[id] = 'running';
            }
          }
        }
        return updated;
      });
    }
    initialize();
  }, [listenersRegistered]);

  async function refresh() {
    setServers(await window.mc.listServers());
  }

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh,
  }));

  const handleStart = (serverId: string) => {
    window.mc.start(serverId, {
      xms: '1G',
      xmx: '2G',
      port: 25565,
      nogui: true,
    });
  };

  const handleStop = (serverId: string) => {
    window.mc.stop(serverId);
  };

  const handleEdit = (serverId: string) => {
    navigate(`/java/edit/${serverId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="overflow-x-auto border-[1px] border-base-300 rounded-lg mt-4">
      <table className="table">
        {/* head */}
        <thead className="bg-accent/15">
          <tr>
            <th>Name</th>
            <th>Version</th>
            <th>Status</th>
            <th>Port</th>
            <th>Last Started</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {servers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-base-content/50">
                No servers found. Import a server to get started.
              </td>
            </tr>
          ) : (
            [...servers]
              .sort((a, b) => {
                // Sort by last started time (newest first), with never-started at bottom
                const aTime = a.lastStartedAt
                  ? new Date(a.lastStartedAt).getTime()
                  : 0;
                const bTime = b.lastStartedAt
                  ? new Date(b.lastStartedAt).getTime()
                  : 0;
                return bTime - aTime;
              })
              .map((server) => {
                const serverStatus = status[server.id] || 'idle';
                const isRunning =
                  serverStatus === 'running' ||
                  serverStatus === 'ready' ||
                  serverStatus === 'starting';

                // Use local state first, then fall back to server data
                const lastStarted =
                  lastStartedTimes[server.id] || server.lastStartedAt;

                return (
                  <tr key={server.id}>
                    <td>{server.name}</td>
                    <td>{server.version || 'Unknown'}</td>
                    <td>
                      <span
                        className={`badge ${isRunning ? 'badge-success bg-opacity-30' : 'badge-ghost'} min-w-20`}
                      >
                        {serverStatus}
                      </span>
                    </td>
                    <td>{server.port || 25565}</td>
                    <td>{lastStarted ? formatDate(lastStarted) : 'Never'}</td>
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
                            onClick={() => handleStart(server.id)}
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

JavaServerTable.displayName = 'JavaServerTable';

export default JavaServerTable;

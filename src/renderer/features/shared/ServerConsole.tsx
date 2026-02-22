import { useEffect, useRef, useState } from 'react';
import { FaPlay, FaTimes } from 'react-icons/fa';

type ConsoleStream = 'stdout' | 'stderr';

type ConsoleLogPayload = {
  id: string;
  line: string;
  stream: ConsoleStream;
};

interface LogEntry {
  id: string;
  line: string;
  stream: ConsoleStream;
  timestamp: Date;
}

interface ServerConsoleProps {
  serverId?: string;
  isServerRunning: boolean;
  onLog: (cb: (d: ConsoleLogPayload) => void) => void;
  executeCommand: (id: string, cmd: string) => Promise<{ ok: boolean }>;
  storageNamespace: string;
  commandPlaceholder?: string;
}

export default function ServerConsole({
  serverId,
  isServerRunning,
  onLog,
  executeCommand,
  storageNamespace,
  commandPlaceholder = "Enter command... (e.g., 'say Hello world!')",
}: ServerConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState('');
  const [executing, setExecuting] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const storageKey = serverId ? `${storageNamespace}-${serverId}` : null;

  useEffect(() => {
    if (!storageKey) return;

    try {
      const storedLogs = localStorage.getItem(storageKey);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        setLogs(parsedLogs);
      }
    } catch (error) {
      console.error('Error loading console logs from storage:', error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || logs.length === 0) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving console logs to storage:', error);
    }
  }, [logs, storageKey]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!serverId) return;

    let active = true;

    const handleLog = (data: ConsoleLogPayload) => {
      if (!active || data.id !== serverId) return;

      setLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          line: data.line,
          stream: data.stream,
          timestamp: new Date(),
        },
      ]);
    };

    onLog(handleLog);

    return () => {
      active = false;
    };
  }, [serverId, onLog]);

  const handleExecuteCommand = async () => {
    if (!serverId || !command.trim() || executing || !isServerRunning) return;

    try {
      setExecuting(true);
      const result = await executeCommand(serverId, command.trim());
      if (result.ok) {
        setCommand('');
      } else {
        console.error('Command execution failed');
      }
    } catch (error) {
      console.error('Error executing command:', error);
    } finally {
      setExecuting(false);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecuteCommand();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 ">
      <div className="flex-1 bg-base-200 rounded-lg p-4 overflow-hidden flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold opacity-70">Console Output</h3>
          <div className="tooltip tooltip-left" data-tip="Clear console">
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={handleClearLogs}
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-base-300 rounded p-3 font-mono text-sm">
          {logs.length === 0 ? (
            <div className="opacity-50">
              {isServerRunning
                ? 'No logs yet...'
                : 'Start the server to view console output'}
            </div>
          ) : (
            <>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`${
                    log.stream === 'stderr' ? 'text-error' : 'text-success'
                  } whitespace-pre-wrap break-words`}
                >
                  <span className="opacity-50 mr-2">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  {log.line}
                </div>
              ))}
              <div ref={logsEndRef} />
            </>
          )}
        </div>
      </div>

      <div
        className={`flex gap-2 ${!isServerRunning ? 'tooltip tooltip-top hover:cursor-not-allowed' : ''}`}
        data-tip={!isServerRunning ? 'Server must be running' : undefined}
      >
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder={commandPlaceholder}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={executing || !isServerRunning}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleExecuteCommand}
          disabled={executing || !command.trim() || !isServerRunning}
          title={
            isServerRunning
              ? 'Execute command (Enter)'
              : 'Server must be running'
          }
        >
          {executing ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <FaPlay />
          )}
        </button>
      </div>
    </div>
  );
}

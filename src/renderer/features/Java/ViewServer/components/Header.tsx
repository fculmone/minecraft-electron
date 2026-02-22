import { McServer } from '@main/minecraftServers/java';
import { FaArrowLeft, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  server: McServer | null;
  isRenaming: boolean;
  newName: string;
  renameSaving: boolean;
  serverStatus: 'starting' | 'ready' | 'running' | 'stopped' | 'error';
  onStartRename: () => void;
  onCancelRename: () => void;
  onSaveRename: () => void;
  onNewNameChange: (name: string) => void;
  onRenameKeyDown: (e: React.KeyboardEvent) => void;
}

export default function Header({
  server,
  isRenaming,
  newName,
  renameSaving,
  serverStatus,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onNewNameChange,
  onRenameKeyDown,
}: HeaderProps) {
  const navigate = useNavigate();

  const statusClass =
    serverStatus === 'error'
      ? 'badge-error'
      : serverStatus === 'ready' || serverStatus === 'running'
        ? 'badge-success bg-opacity-30'
        : serverStatus === 'starting'
          ? 'badge-warning'
          : 'badge-ghost';

  return (
    <div className="flex-shrink-0 bg-base-100 border-b border-base-300 p-4 rounded-lg">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <button
          className="btn btn-ghost btn-square"
          onClick={() => navigate('/java')}
          title="Back to servers"
          type="button"
        >
          <FaArrowLeft className="size-5" />
        </button>
        <div className="flex-1 mb">
          {isRenaming ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text"
                className="input input-bordered text-xl font-bold h-10 "
                value={newName}
                onChange={(e) => onNewNameChange(e.target.value)}
                onKeyDown={onRenameKeyDown}
                disabled={renameSaving}
                autoFocus
                placeholder="Server name"
              />
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={onSaveRename}
                disabled={renameSaving || !newName.trim()}
              >
                {renameSaving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <FaSave />
                )}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onCancelRename}
                disabled={renameSaving}
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl font-bold">{server?.name}</h1>
              <button
                type="button"
                className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onStartRename}
                title="Rename server"
              >
                <FaEdit className="size-4" />
              </button>
            </div>
          )}
          <p className="text-sm opacity-70">{server?.version}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`badge ${statusClass} min-w-20`}>
            {serverStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

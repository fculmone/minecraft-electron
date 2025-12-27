import { FaUserCheck, FaBan, FaTrash } from 'react-icons/fa';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  isOnline: boolean;
  isWhitelisted: boolean;
  isBanned: boolean;
  onToggleWhitelist: () => void;
  onToggleBan: () => void;
  onRemove: () => void;
  isServerRunning: boolean;
  restrictionMode: 'none' | 'whitelist' | 'blacklist';
}

export default function PlayerCard({
  player,
  isOnline,
  isWhitelisted,
  isBanned,
  onToggleWhitelist,
  onToggleBan,
  onRemove,
  isServerRunning,
  restrictionMode,
}: PlayerCardProps) {
  // Use UUID if available, fallback to username
  const identifier = player.uuid || player.username;
  const headUrl = `https://minotar.net/helm/${identifier}/100.png`;

  return (
    <div
      className={`card bg-base-100 shadow-md border ${isBanned ? 'border-error/50 opacity-75' : 'border-base-300'}`}
    >
      <div className="card-body p-4">
        {/* Head and Name */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={headUrl}
            alt={player.username}
            className="w-16 h-16 rounded"
            onError={(e) => {
              e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23c0c0c0' width='100' height='100'/%3E%3C/svg%3E`;
            }}
          />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{player.username}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${isOnline && isServerRunning ? 'bg-success' : 'bg-base-content/30'}`}
              />
              <span className="text-xs text-base-content/60">
                {isOnline && isServerRunning ? 'Online' : 'Offline'}
              </span>
            </div>
            {player.lastSeen && (
              <p className="text-xs text-base-content/50 mt-1">
                Last seen:{' '}
                {`${player.lastSeen.toLocaleDateString()} ${player.lastSeen.toLocaleTimeString()}`}
              </p>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {isWhitelisted && restrictionMode === 'whitelist' && (
            <span className="badge badge-success gap-1 text-xs">
              <FaUserCheck className="w-3 h-3" />
              Whitelisted
            </span>
          )}
          {isBanned && restrictionMode === 'blacklist' && (
            <span className="badge badge-error gap-1 text-xs">
              <FaBan className="w-3 h-3" />
              Banned
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {restrictionMode === 'whitelist' && (
            <button
              onClick={onToggleWhitelist}
              disabled={isBanned}
              className={`btn btn-sm flex-1 gap-1 ${
                isWhitelisted ? 'btn-success' : 'btn-ghost border-base-300'
              } ${isBanned ? 'btn-disabled' : ''}`}
              title={isBanned ? 'Cannot whitelist banned players' : ''}
              type="button"
            >
              <FaUserCheck className="w-3 h-3" />
              {isWhitelisted ? 'Remove' : 'Whitelist'}
            </button>
          )}
          {restrictionMode === 'blacklist' && (
            <button
              onClick={onToggleBan}
              className={`btn btn-sm flex-1 gap-1 ${
                isBanned ? 'btn-error' : 'btn-ghost border-base-300'
              }`}
              type="button"
            >
              <FaBan className="w-3 h-3" />
              {isBanned ? 'Unban' : 'Ban'}
            </button>
          )}
          <button
            onClick={onRemove}
            className="btn btn-sm btn-ghost btn-square border-base-300"
            type="button"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>

        {/* Info
        {isServerRunning && (
          <p className="text-xs text-success mt-3 text-center">
            Commands will be executed on the server
          </p>
        )} */}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { Player } from '../types';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (username: string, uuid: string) => void;
  existingPlayers: Player[];
}

export default function AddPlayerModal({
  isOpen,
  onClose,
  onAdd,
  existingPlayers,
}: AddPlayerModalProps) {
  const [username, setUsername] = useState('');
  const [uuid, setUuid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchProfile = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    // Check for duplicate player
    const isDuplicate = existingPlayers.some(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    );
    if (isDuplicate) {
      setError(`"${username}" is already in your player list`);
      return;
    }

    const result = await window.player.fetchUUID(username.trim());
    if (typeof result === 'object' && result.error) {
      if (result.error === 'not_found') {
        setError(`Player "${username}" not found`);
      } else {
        setError('Network error. Please try again.');
      }
      setLoading(false);
      return;
    }
    if (!result.id) {
      setError('Unexpected error occurred. Please try again.');
      setLoading(false);
      return;
    }
    setUuid(result.id);
    setLoading(false);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (!uuid.trim()) {
      setError('Please try again');
      return;
    }

    onAdd(username.trim(), uuid.trim());
    setUsername('');
    setUuid('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Add Player</h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="form-control">
            <div className="label">
              <span className="label-text">Minecraft Username</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && username.trim()) {
                    handleFetchProfile();
                  }
                }}
                className="input input-bordered flex-1"
              />
              <button
                type="button"
                onClick={handleFetchProfile}
                disabled={loading || !username.trim()}
                className="btn btn-primary"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Success Preview */}
          {uuid && !error && (
            <div className="alert alert-success flex text-left">
              <div className="flex items-center gap-3">
                <img
                  src={`https://minotar.net/helm/${uuid}/64.png`}
                  alt={username}
                  className="w-12 h-12 rounded"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%2362c15e' width='100' height='100'/%3E%3C/svg%3E`;
                  }}
                />
                <div>
                  <p className="font-bold">{username}</p>
                  <p className="text-sm opacity-90">
                    Player found! Ready to add.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* 
          
          <div className="alert alert-info text-sm">
            <span>
              Enter a player's username and click "Fetch" to get their profile
              from Mojang's API. Then click "Add" to add them to your server.
            </span>
          </div> 
*/}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end mt-6">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!username.trim() || !uuid.trim()}
              className="btn btn-primary"
            >
              Add Player
            </button>
          </div>
        </form>
      </div>

      {/* Modal Backdrop */}
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  );
}

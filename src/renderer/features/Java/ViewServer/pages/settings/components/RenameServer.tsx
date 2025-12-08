import { useState } from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

interface RenameServerProps {
  serverId: string;
  currentName: string;
  onNameUpdated?: (newName: string) => void;
}

export default function RenameServer({
  serverId,
  currentName,
  onNameUpdated,
}: RenameServerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!newName.trim()) {
      setError('Server name cannot be empty');
      return;
    }

    if (newName === currentName) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const success = await window.mc.editServer(serverId, { name: newName });

      if (success) {
        setIsEditing(false);
        onNameUpdated?.(newName);
      } else {
        setError('Failed to update server name');
      }
    } catch (err) {
      console.error('Error updating server name:', err);
      setError('An error occurred while updating the server name');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewName(currentName);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">Server Name</span>
      </label>

      <div className="flex gap-2 items-start">
        {isEditing ? (
          <>
            <input
              type="text"
              className={`input input-bordered flex-1 ${error ? 'input-error' : ''}`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={saving}
              autoFocus
              placeholder="Enter server name"
            />
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSave}
              disabled={saving || !newName.trim()}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <FaSave />
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCancel}
              disabled={saving}
            >
              <FaTimes />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 px-4 py-3 bg-base-200 rounded-lg">
              {currentName}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit />
            </button>
          </>
        )}
      </div>

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

import { BedrockServer, BedrockServerAPI } from '@renderer/preload';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Console from './pages/console/Console';
import BedrockSettings from './pages/settings/BedrockSettings';

type BedrockPropertyValue = string | number | boolean;

declare global {
  interface Window {
    bedrock: BedrockServerAPI;
  }
}

export default function BedrockViewServer() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [server, setServer] = useState<BedrockServer | null>(null);
  const [properties, setProperties] = useState<
    Record<string, BedrockPropertyValue>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'settings'>('console');
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  useEffect(() => {
    if (typeof id !== 'string') return;
    const serverId: string = id;

    async function loadData() {
      try {
        setLoading(true);
        const [serverData, propsData, runningStatus] = await Promise.all([
          window.bedrock.getServer(serverId),
          window.bedrock.getServerProperties(serverId),
          window.bedrock.getRunningStatus(),
        ]);

        setServer(serverData);
        setProperties(propsData);
        setIsServerRunning(runningStatus[serverId] ?? false);
      } catch (error) {
        console.error('Error loading bedrock server data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const handleStatusChange = (data: {
      id: string;
      status: 'starting' | 'ready' | 'stopped' | 'error';
    }) => {
      if (data.id === id) {
        setIsServerRunning(
          data.status === 'ready' || data.status === 'starting',
        );
      }
    };

    window.bedrock.onStatus(handleStatusChange);
  }, [id]);

  const handlePropertyChange = (key: string, value: string) => {
    setProperties((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveProperties = async () => {
    if (!id) return;

    try {
      setSaving(true);
      await window.bedrock.saveServerProperties(id, properties);
    } catch (error) {
      console.error('Error saving bedrock server properties:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStartRename = () => {
    setNewName(server?.name || '');
    setIsRenaming(true);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewName('');
  };

  const handleSaveRename = async () => {
    if (!id || !newName.trim()) return;

    try {
      setRenameSaving(true);
      const success = await window.bedrock.editServer(id, {
        name: newName.trim(),
      });
      if (success) {
        setServer((prev) => (prev ? { ...prev, name: newName.trim() } : prev));
        setIsRenaming(false);
      }
    } catch (error) {
      console.error('Error renaming bedrock server:', error);
    } finally {
      setRenameSaving(false);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex-shrink-0 bg-base-100 border-b border-base-300 p-4 rounded-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            className="btn btn-ghost btn-square"
            onClick={() => navigate('/bedrock')}
            title="Back to servers"
            type="button"
          >
            <FaArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            {isRenaming ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  className="input input-bordered text-xl font-bold h-10"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  disabled={renameSaving}
                  autoFocus
                  placeholder="Server name"
                />
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleSaveRename}
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
                  onClick={handleCancelRename}
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
                  onClick={handleStartRename}
                  title="Rename server"
                >
                  <FaEdit className="size-4" />
                </button>
              </div>
            )}
            <p className="text-sm opacity-70">
              {server?.versionGuess || 'Bedrock Server'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`badge ${isServerRunning ? 'badge-success bg-opacity-30' : 'badge-ghost'} min-w-20`}
            >
              {isServerRunning ? 'running' : 'stopped'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-6 py-3 rounded-lg cursor-pointer transition-all hover:bg-base-200 ${
            activeTab === 'console' ? 'bg-base-100 shadow-lg' : ''
          }`}
        >
          Console
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 rounded-lg cursor-pointer transition-all hover:bg-base-200 ${
            activeTab === 'settings' ? 'bg-base-100 shadow-lg' : ''
          }`}
        >
          Settings
        </button>
      </div>

      {activeTab === 'console' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg flex flex-col flex-1 mb-16 max-h-[600px]">
          <Console isServerRunning={isServerRunning} />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg">
          <BedrockSettings
            properties={properties}
            onPropertyChange={handlePropertyChange}
            onSave={handleSaveProperties}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
}

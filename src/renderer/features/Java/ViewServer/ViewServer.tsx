import { MinecraftServerAPI } from '@renderer/preload';
import { McServer } from '@main/minecraftServers/java';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ServerPropertiesPanel from './pages/settings/ServerSettings';
import Console from './pages/console/Console';
import Header from './components/Header';
import Backups from './pages/backups/Backups';
import Players from './pages/players/Players';

declare global {
  interface Window {
    mc: MinecraftServerAPI;
  }
}

export default function ViewServer() {
  const [server, setServer] = useState<McServer | null>(null);
  const [properties, setProperties] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('players');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [serverStatus, setServerStatus] = useState<
    'starting' | 'ready' | 'running' | 'stopped' | 'error'
  >('stopped');
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        const [serverData, propsData, runningStatus] = await Promise.all([
          window.mc.getServer(id!),
          window.mc.getServerProperties(id!),
          window.mc.getRunningStatus(),
        ]);
        setServer(serverData);
        setProperties(propsData);
        const isRunning = runningStatus[id] ?? false;
        setIsServerRunning(isRunning);
        setServerStatus(isRunning ? 'running' : 'stopped');
      } catch (error) {
        console.error('Error loading server data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Listen for server status changes
  useEffect(() => {
    const handleStatusChange = (data: {
      id: string;
      status: 'starting' | 'ready' | 'stopped' | 'error';
      message?: string;
    }) => {
      if (data.id === id) {
        setServerStatus(data.status);
        setIsServerRunning(
          data.status === 'starting' || data.status === 'ready',
        );
      }
    };

    window.mc.onStatus(handleStatusChange);

    return () => {
      // Note: onStatus doesn't return an unsubscribe function in the current API
      // This cleanup is a placeholder for future implementation
    };
  }, [id]);

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
      const success = await window.mc.editServer(id, { name: newName.trim() });
      if (success) {
        setServer((prev) => (prev ? { ...prev, name: newName.trim() } : prev));
        setIsRenaming(false);
      }
    } catch (error) {
      console.error('Error renaming server:', error);
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

  return (
    <div className="flex flex-col gap-4 h-full">
      <Header
        server={server}
        isRenaming={isRenaming}
        newName={newName}
        renameSaving={renameSaving}
        onStartRename={handleStartRename}
        onCancelRename={handleCancelRename}
        onSaveRename={handleSaveRename}
        onNewNameChange={setNewName}
        onRenameKeyDown={handleRenameKeyDown}
        serverStatus={serverStatus}
      />

      {/* Tab buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('players')}
          className={`px-6 py-3 rounded-lg cursor-pointer transition-all hover:bg-base-200 ${
            activeTab === 'players' ? 'bg-base-100 shadow-lg' : ''
          }`}
        >
          Players
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 rounded-lg cursor-pointer transition-all hover:bg-base-200 ${
            activeTab === 'settings' ? 'bg-base-100 shadow-lg' : ''
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          className={`px-6 py-3 rounded-lg cursor-pointer transition-all hover:bg-base-200 ${
            activeTab === 'backups' ? 'bg-base-100 shadow-lg' : ''
          }`}
        >
          Backups
        </button>
        <button
          onClick={() => setActiveTab('console')}
          className={`px-6 py-3 rounded-lg cursor-pointer transition-all hover:bg-base-200 ${
            activeTab === 'console' ? 'bg-base-100 shadow-lg' : ''
          }`}
        >
          Console
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'players' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg">
          <Players isServerRunning={isServerRunning} />
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg">
          <ServerPropertiesPanel isServerRunning={isServerRunning} />
        </div>
      )}
      {activeTab === 'backups' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg">
          <Backups isServerRunning={isServerRunning} />
        </div>
      )}
      {activeTab === 'console' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg flex flex-col flex-1 mb-16 max-h-[600px]">
          <Console isServerRunning={isServerRunning} />
        </div>
      )}
    </div>
  );
}

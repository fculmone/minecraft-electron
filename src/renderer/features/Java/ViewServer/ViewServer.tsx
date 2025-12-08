import { MinecraftServerAPI } from '@renderer/preload';
import { McServer } from '@main/minecraftServers/java';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ServerPropertiesPanel from './pages/settings/ServerSettings';
import Header from './components/Header';

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
  const [activeTab, setActiveTab] = useState('settings');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        const [serverData, propsData] = await Promise.all([
          window.mc.getServer(id!),
          window.mc.getServerProperties(id!),
        ]);
        setServer(serverData);
        setProperties(propsData);
      } catch (error) {
        console.error('Error loading server data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
    <div className="flex flex-col gap-4">
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
          Players content
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg">
          <ServerPropertiesPanel />
        </div>
      )}
      {activeTab === 'backups' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg">
          Backups content
        </div>
      )}
      {activeTab === 'console' && (
        <div className="bg-base-100 border-base-300 p-6 rounded-lg">
          Console content
        </div>
      )}
    </div>
  );
}

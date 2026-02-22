import { MinecraftServerAPI } from '@renderer/preload';
import { McServer } from '@main/minecraftServers/java';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Core from './pages/Core';
import World from './pages/World';
import Performance from './pages/Performance';
import Security from './pages/Security';
import Comms from './pages/Comms';
import Resources from './pages/Resources';
import Admin from './pages/Admin';
import Misc from './pages/Misc';
import SettingsHeader from './components/SettingsHeader';
import type { ServerProperties } from '@main/minecraftServers/javaTypes';

declare global {
  interface Window {
    mc: MinecraftServerAPI;
  }
}

export default function ServerPropertiesPanel({
  isServerRunning,
}: {
  isServerRunning: boolean;
}) {
  const [server, setServer] = useState<McServer | null>(null);
  const [properties, setProperties] = useState<ServerProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [deletingServer, setDeletingServer] = useState(false);
  const navigate = useNavigate();
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

  const handleSave = async () => {
    if (!id || !properties) return;

    try {
      setSaving(true);
      const result = await window.mc.saveServerProperties(id, properties);
      if (result.ok) {
        // Not using alert anymore, parent will show toast/message
        setShowSaved(true);
        window.setTimeout(() => setShowSaved(false), 7000);
      } else {
        alert(`Failed to save server properties: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving properties:', error);
      alert(`Error saving properties: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePropertyChange = (key: string, value: any) => {
    setProperties((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value } as ServerProperties;
    });
  };

  const handleDeleteServer = async () => {
    if (!id || !server || deletingServer) return;
    if (isServerRunning) {
      alert('Stop the server before deleting it.');
      return;
    }

    const confirmed = confirm(
      `Delete server "${server.name}"?\n\nThis permanently removes the server and all data, including worlds and backups.`,
    );
    if (!confirmed) return;

    const typedName = prompt(
      `Type the server name to confirm deletion:\n\n${server.name}`,
    );
    if (typedName !== server.name) {
      alert('Server name did not match. Delete canceled.');
      return;
    }

    try {
      setDeletingServer(true);
      await window.mc.removeServer(id);
      navigate('/java');
    } catch (error: any) {
      console.error('Error deleting server:', error);
      alert(`Failed to delete server: ${error?.message || error}`);
    } finally {
      setDeletingServer(false);
    }
  };

  if (loading || !properties) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const tabs = [
    { label: 'Core' },
    { label: 'World' },
    { label: 'Performance' },
    { label: 'Security' },
    { label: 'Comms' },
    { label: 'Resources' },
    { label: 'Admin' },
    { label: 'Misc' },
  ];

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <SettingsHeader
        onSave={handleSave}
        saving={saving}
        isServerRunning={isServerRunning}
        showSaved={showSaved}
      />

      {/* Tabs Navigation */}
      <div
        className="flex-shrink-0 border-b border-base-300"
        style={{ overflowX: 'auto', overflowY: 'hidden' }}
      >
        <div
          role="tablist"
          className="tabs tabs-lifted"
          style={{ display: 'inline-flex', minWidth: '100%' }}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              className={`tab ${activeTab === index ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-auto bg-base-100 p-6 w-full">
        {activeTab === 0 ? (
          <Core
            properties={properties}
            onPropertyChange={handlePropertyChange}
            onDeleteServer={handleDeleteServer}
            deletingServer={deletingServer}
            isServerRunning={isServerRunning}
          />
        ) : activeTab === 1 ? (
          <World
            properties={properties}
            onPropertyChange={handlePropertyChange}
          />
        ) : activeTab === 2 ? (
          <Performance
            properties={properties}
            onPropertyChange={handlePropertyChange}
          />
        ) : activeTab === 3 ? (
          <Security
            properties={properties}
            onPropertyChange={handlePropertyChange}
          />
        ) : activeTab === 4 ? (
          <Comms
            properties={properties}
            onPropertyChange={handlePropertyChange}
          />
        ) : activeTab === 5 ? (
          <Resources
            properties={properties}
            onPropertyChange={handlePropertyChange}
          />
        ) : activeTab === 6 ? (
          <Admin
            properties={properties}
            onPropertyChange={handlePropertyChange}
          />
        ) : (
          <Misc
            properties={properties}
            onPropertyChange={handlePropertyChange}
          />
        )}
      </div>

      {/* Properties Grid
      <div className="max-w-6xl mx-auto w-full px-4 pb-6 ">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body w-full">
            {filteredProperties.length === 0 ? (
              <p className="text-center text-base-content/50">
                {searchTerm
                  ? 'No properties match your search'
                  : 'No properties found'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProperties.map(([key, value]) =>
                  renderPropertyInput(key, value),
                )}
              </div>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
}

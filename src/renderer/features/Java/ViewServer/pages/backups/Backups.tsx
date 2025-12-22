import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

declare global {
  interface Window {
    mc: {
      getBackupSettings: (id: string) => Promise<{
        enabled: boolean;
        onStart: boolean;
        maxBackups: number;
        frequencyMinutes: number;
      }>;
      setBackupSettings: (
        id: string,
        settings: {
          enabled: boolean;
          onStart: boolean;
          maxBackups: number;
          frequencyMinutes: number;
        },
      ) => Promise<{ ok: boolean }>;
      listBackups: (
        id: string,
      ) => Promise<Array<{ id: string; timestamp: number }>>;
      createBackup: (id: string) => Promise<{ ok: boolean }>;
      deleteBackup: (id: string, backupId: string) => Promise<{ ok: boolean }>;
      restoreBackup: (id: string, backupId: string) => Promise<{ ok: boolean }>;
    };
  }
}

type BackupItem = {
  id: string;
  timestamp: Date;
};

interface BackupsProps {
  isServerRunning: boolean;
}

export default function Backups({ isServerRunning }: BackupsProps) {
  const { id } = useParams<{ id: string }>();
  const [enabled, setEnabled] = useState(false);
  const [autoOnStart, setAutoOnStart] = useState(false);
  const [maxBackups, setMaxBackups] = useState<number>(10);
  const [frequencyMinutes, setFrequencyMinutes] = useState<number>(60);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Load settings and backups
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const s = await window.mc.getBackupSettings(id);
        setEnabled(!!s.enabled);
        setAutoOnStart(!!s.onStart);
        setMaxBackups(Number(s.maxBackups) || 10);
        setFrequencyMinutes(Number(s.frequencyMinutes) || 60);
        const list = await window.mc.listBackups(id);
        setBackups(
          list.map((b) => ({ id: b.id, timestamp: new Date(b.timestamp) })),
        );
      } catch (e) {
        console.error('Failed to load backup settings/list', e);
      }
    })();
  }, [id]);

  const sortedBackups = useMemo(
    () =>
      [...backups].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      ),
    [backups],
  );

  const handleCreateBackup = async () => {
    if (!id || creating) return;
    setCreating(true);
    try {
      const res = await window.mc.createBackup(id);
      if (res.ok) {
        const list = await window.mc.listBackups(id);
        setBackups(
          list.map((b) => ({ id: b.id, timestamp: new Date(b.timestamp) })),
        );
      }
    } catch (e: any) {
      console.error('Create backup failed', e);
      alert(`Failed to create backup: ${e.message || e}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (backupId: string) => {
    if (!id) return;
    if (!confirm('Delete this backup?')) return;
    try {
      const res = await window.mc.deleteBackup(id, backupId);
      if (res.ok) {
        const list = await window.mc.listBackups(id);
        setBackups(
          list.map((b) => ({ id: b.id, timestamp: new Date(b.timestamp) })),
        );
      }
    } catch (e) {
      console.error('Delete backup failed', e);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!id) return;
    if (
      !confirm(
        'Restore this backup? This will replace your current world. Make sure the server is stopped.',
      )
    )
      return;
    try {
      const res = await window.mc.restoreBackup(id, backupId);
      if (res.ok) {
        alert('Backup restored successfully!');
        // Optionally refresh backups
        const list = await window.mc.listBackups(id);
        setBackups(
          list.map((b) => ({ id: b.id, timestamp: new Date(b.timestamp) })),
        );
      }
    } catch (e: any) {
      console.error('Restore backup failed', e);
      alert(`Failed to restore backup: ${e.message || e}`);
    }
  };

  const persistSettings = async (
    next: Partial<{
      enabled: boolean;
      onStart: boolean;
      maxBackups: number;
      frequencyMinutes: number;
    }>,
  ) => {
    if (!id) return;
    setSavingSettings(true);
    try {
      const settings = {
        enabled,
        onStart: autoOnStart,
        maxBackups,
        frequencyMinutes,
        ...next,
      };
      await window.mc.setBackupSettings(id, settings);
    } catch (e) {
      console.error('Save settings failed', e);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-base-200 rounded-lg p-4 flex flex-col gap-3 ">
          <div className="flex items-center justify-between ">
            <span className="font-semibold">Enable automatic backups</span>
            <input
              type="checkbox"
              className="toggle"
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
                persistSettings({ enabled: e.target.checked });
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Create on server start</span>
            <input
              type="checkbox"
              className="toggle"
              checked={autoOnStart}
              onChange={(e) => {
                setAutoOnStart(e.target.checked);
                persistSettings({ onStart: e.target.checked });
              }}
            />
          </div>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Max backups to keep</span>
            </div>
            <input
              type="number"
              min={1}
              className="input input-bordered"
              value={maxBackups}
              onChange={(e) => {
                const v = Math.max(1, Number(e.target.value));
                setMaxBackups(v);
                persistSettings({ maxBackups: v });
              }}
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Backup frequency (minutes)</span>
            </div>
            <input
              type="number"
              min={1}
              className="input input-bordered"
              value={frequencyMinutes}
              onChange={(e) => {
                const v = Math.max(1, Number(e.target.value));
                setFrequencyMinutes(v);
                persistSettings({ frequencyMinutes: v });
              }}
              disabled={!enabled}
            />
          </label>
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={handleCreateBackup}
            disabled={creating}
          >
            {creating ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Create backup'
            )}
          </button>
        </div>

        <div className="bg-base-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Backups</h3>
          {sortedBackups.length === 0 ? (
            <div className="opacity-60">No backups yet.</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sortedBackups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between bg-base-100 rounded-lg px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">
                      {backup.timestamp.toLocaleString()}
                    </span>
                    <span className="text-xs opacity-60">{backup.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className={
                        isServerRunning ? 'tooltip tooltip-bottom' : ''
                      }
                      data-tip={
                        isServerRunning
                          ? 'Stop the server before restoring'
                          : undefined
                      }
                    >
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleRestore(backup.id)}
                        disabled={isServerRunning}
                        type="button"
                      >
                        Restore
                      </button>
                    </div>
                    <button
                      className="btn btn-error btn-xs"
                      onClick={() => handleDelete(backup.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

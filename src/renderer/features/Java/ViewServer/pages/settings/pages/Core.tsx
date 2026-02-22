import type { ServerProperties } from '@main/minecraftServers/javaTypes';
import { TAB_FIELDS, PROPERTY_META } from '../lib/settingsMeta';
import RenderPropertyInput from '../components/RenderPropertyInput';

interface CoreProps {
  properties: ServerProperties;
  onPropertyChange: (key: keyof ServerProperties, value: any) => void;
  onDeleteServer: () => void;
  deletingServer: boolean;
  isServerRunning: boolean;
}

export default function Core({
  properties,
  onPropertyChange,
  onDeleteServer,
  deletingServer,
  isServerRunning,
}: CoreProps) {
  const fields = TAB_FIELDS.core;

  return (
    <div className="space-y-6 ">
      <div className="text-sm text-base-content/70 mb-4">
        Core server settings including gamemode, difficulty, and player limits.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {fields.map((field) => {
          const meta = PROPERTY_META[field];
          return (
            <RenderPropertyInput
              key={field}
              propertyKey={field}
              value={properties[field]}
              meta={meta}
              onChange={onPropertyChange}
            />
          );
        })}
      </div>

      <div className="p-4 rounded-lg border border-error/40 bg-base-200">
        <h3 className="text-lg font-semibold text-error">Danger Zone</h3>
        <p className="text-sm opacity-80 mt-1 mb-3">
          Deleting a server is permanent and removes all files for this server,
          including worlds and backups.
        </p>
        <button
          type="button"
          className="btn btn-error"
          onClick={onDeleteServer}
          disabled={deletingServer || isServerRunning}
          title={
            isServerRunning
              ? 'Stop the server before deleting it'
              : 'Delete this server permanently'
          }
        >
          {deletingServer ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            'Delete Server'
          )}
        </button>
      </div>
    </div>
  );
}

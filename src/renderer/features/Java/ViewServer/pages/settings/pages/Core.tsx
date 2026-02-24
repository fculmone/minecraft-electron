import type { ServerProperties } from '@main/minecraftServers/javaTypes';
import { useState } from 'react';
import { TAB_FIELDS, PROPERTY_META } from '../lib/settingsMeta';
import RenderPropertyInput from '../components/RenderPropertyInput';

interface CoreProps {
  properties: ServerProperties;
  onPropertyChange: (key: keyof ServerProperties, value: any) => void;
  serverName: string;
  onDeleteServer: (typedName: string) => void;
  deletingServer: boolean;
  isServerRunning: boolean;
}

export default function Core({
  properties,
  onPropertyChange,
  serverName,
  onDeleteServer,
  deletingServer,
  isServerRunning,
}: CoreProps) {
  const fields = TAB_FIELDS.core;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [typedName, setTypedName] = useState('');
  const nameMatches = typedName.trim() === serverName;
  const isDeleteDisabled = deletingServer || isServerRunning;
  let deleteTooltip: string | undefined;
  if (isServerRunning) {
    deleteTooltip = 'Stop the server before deleting it';
  } else if (deletingServer) {
    deleteTooltip = 'Deletion in progress';
  }

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
        <div
          className={isDeleteDisabled ? 'tooltip tooltip-right' : ''}
          data-tip={isDeleteDisabled ? deleteTooltip : undefined}
        >
          <button
            type="button"
            className="btn btn-error"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleteDisabled}
          >
            {deletingServer ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Delete Server'
            )}
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 rounded-lg border border-error/30 bg-base-100 p-4">
            <p className="text-sm mb-2">
              Type <span className="font-semibold">{serverName}</span> to
              confirm deletion.
            </p>
            <input
              type="text"
              className={`input input-bordered w-full ${typedName && !nameMatches ? 'input-error' : ''}`}
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={serverName}
              disabled={deletingServer}
            />
            {typedName && !nameMatches && (
              <p className="text-error text-sm mb-3">
                Server name must match exactly.
              </p>
            )}
            <div className="flex my-3 gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTypedName('');
                }}
                disabled={deletingServer}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={() => onDeleteServer(typedName)}
                disabled={deletingServer || isServerRunning || !nameMatches}
              >
                {deletingServer ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

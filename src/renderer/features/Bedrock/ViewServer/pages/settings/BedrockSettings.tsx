import { useMemo } from 'react';

type BedrockPropertyValue = string | number | boolean;

interface BedrockSettingsProps {
  properties: Record<string, BedrockPropertyValue>;
  onPropertyChange: (key: string, value: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const FIELDS: Array<{ key: string; label: string; placeholder?: string }> = [
  { key: 'server-name', label: 'Server Name', placeholder: 'Bedrock Server' },
  { key: 'level-name', label: 'World Name', placeholder: 'Bedrock level' },
  { key: 'server-port', label: 'Server Port', placeholder: '19132' },
  { key: 'server-portv6', label: 'Server Port (IPv6)', placeholder: '19133' },
  { key: 'max-players', label: 'Max Players', placeholder: '10' },
];

export default function BedrockSettings({
  properties,
  onPropertyChange,
  onSave,
  saving,
}: BedrockSettingsProps) {
  const missingKeyCount = useMemo(() => {
    return FIELDS.filter((field) => properties[field.key] === undefined).length;
  }, [properties]);

  return (
    <div className="space-y-5">
      <div className="text-sm opacity-70">
        Configure common Bedrock properties. Additional advanced keys can still
        be edited directly in server files.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.key} className="form-control w-full">
            <div className="label">
              <span className="label-text">{field.label}</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full"
              value={String(properties[field.key] ?? '')}
              onChange={(e) => onPropertyChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs opacity-60">
          {missingKeyCount > 0
            ? `${missingKeyCount} fields are currently unset.`
            : 'All common fields are configured.'}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}

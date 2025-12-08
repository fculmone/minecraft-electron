import { FaSave } from 'react-icons/fa';

interface SettingsHeaderProps {
  onSave: () => void;
  saving: boolean;
}

export default function SettingsHeader({
  onSave,
  saving,
}: SettingsHeaderProps) {
  return (
    <div className="flex-shrink-0 bg-base-100 border-b border-base-300 p-4">
      <div className="max-w-6xl mx-auto flex items-baseline gap-4 ">
        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <FaSave className="h-full" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}

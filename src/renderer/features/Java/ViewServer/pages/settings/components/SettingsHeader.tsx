import { FaCheck, FaSave } from 'react-icons/fa';

interface SettingsHeaderProps {
  onSave: () => void;
  saving: boolean;
  isServerRunning: boolean;
  showSaved: boolean;
}

export default function SettingsHeader({
  onSave,
  saving,
  isServerRunning,
  showSaved,
}: SettingsHeaderProps) {
  const showCheck = showSaved && !saving;

  const getButtonContent = () => {
    if (saving) {
      return <span className="loading loading-spinner loading-sm" />;
    }
    if (showCheck) {
      return <FaCheck className="h-full" />;
    }
    return <FaSave className="h-full" />;
  };

  return (
    <div className="flex-shrink-0 bg-base-100 border-b border-base-300 py-4">
      <div className="max-w-6xl mx-auto flex h-full items-center justify-start gap-4">
        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={onSave}
          disabled={saving}
        >
          {getButtonContent()}
          Save Changes
        </button>
        {showSaved && isServerRunning && (
          <span className="text-sm text-warning fade-in-out duration-75">
            Settings saved. Restart server to apply changes.
          </span>
        )}
      </div>
    </div>
  );
}

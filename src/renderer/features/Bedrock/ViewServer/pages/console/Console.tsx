import { BedrockServerAPI } from '@renderer/preload';
import ServerConsole from '@renderer/features/shared/ServerConsole';
import { useParams } from 'react-router-dom';

declare global {
  interface Window {
    bedrock: BedrockServerAPI;
  }
}

interface ConsoleProps {
  isServerRunning: boolean;
}

export default function Console({ isServerRunning }: ConsoleProps) {
  const { id } = useParams<{ id: string }>();

  return (
    <ServerConsole
      serverId={id}
      isServerRunning={isServerRunning}
      onLog={window.bedrock.onLog}
      executeCommand={window.bedrock.cmd}
      storageNamespace="bedrock-console-logs"
      commandPlaceholder="Enter Bedrock command... (e.g., 'list')"
    />
  );
}

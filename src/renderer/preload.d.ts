import { ElectronHandler, ExeHandler } from '../main/preload';
import type { ServerProperties } from '@main/minecraftServers/javaTypes';

export type BedrockServer = {
  id: string;
  name: string;
  dir: string;
  exePath: string;
  createdAt: string;
  versionGuess?: string;
  port?: number;
  portV6?: number;
};

export type MinecraftServerAPI = {
  importServers: () => Promise<any[]>;
  listServers: () => Promise<any[]>;
  editServer: (id: string, updates: any) => Promise<boolean>;
  getServer: (id: string) => Promise<any>;
  getServerProperties: (id: string) => Promise<ServerProperties>;
  saveServerProperties: (
    id: string,
    properties: ServerProperties,
  ) => Promise<{ ok: boolean; error?: string }>;
  validate: (
    id: string,
    expectedSha256?: string,
  ) => Promise<{ ok: boolean; sha256: string }>;
  start: (
    id: string,
    opts?: {
      xms?: string;
      xmx?: string;
      port?: number;
      nogui?: boolean;
      extraJvmArgs?: string[];
    },
  ) => Promise<{ ok: boolean; pid?: number; error?: string }>;
  cmd: (id: string, cmd: string) => Promise<{ ok: boolean }>;
  stop: (id: string) => Promise<{ ok: boolean }>;
  getRunningStatus: () => Promise<Record<string, boolean>>;
  onLog: (
    cb: (d: { id: string; line: string; stream: 'stdout' | 'stderr' }) => void,
  ) => void;
  onStatus: (
    cb: (d: {
      id: string;
      status: 'starting' | 'ready' | 'stopped' | 'error';
      message?: string;
    }) => void,
  ) => void;
};

export type BedrockServerAPI = {
  importServers: () => Promise<BedrockServer[]>;
  listServers: () => Promise<BedrockServer[]>;
  start: (
    id: string,
    opts?: { port?: number; portV6?: number },
  ) => Promise<{ ok: boolean; pid?: number; error?: string }>;
  cmd: (id: string, cmd: string) => Promise<{ ok: boolean }>;
  stop: (id: string) => Promise<{ ok: boolean }>;
  onLog: (
    cb: (d: { id: string; line: string; stream: 'stdout' | 'stderr' }) => void,
  ) => void;
  onStatus: (
    cb: (d: {
      id: string;
      status: 'starting' | 'ready' | 'stopped' | 'error';
      message?: string;
    }) => void,
  ) => void;
};

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    exe: ExeHandler;
    mc: MinecraftServerAPI;
    bedrock: BedrockServerAPI;
  }
}

export {};

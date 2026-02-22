import { ElectronHandler, ExeHandler, PlayerHandler } from '../main/preload';
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
  removeServer: (id: string) => Promise<void>;
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
  onPlayerJoined: (
    cb: (d: { id: string; username: string; timestamp: number }) => void,
  ) => void;
  onPlayerLeft: (
    cb: (d: { id: string; username: string; timestamp: number }) => void,
  ) => void;
  onOnlinePlayers: (cb: (d: { id: string; players: string[] }) => void) => void;
  onStatus: (
    cb: (d: {
      id: string;
      status: 'starting' | 'ready' | 'stopped' | 'error';
      message?: string;
    }) => void,
  ) => void;
  getWhiteAndBlacklist: (id: string) => Promise<{
    whitelist: { uuid: string; name: string }[];
    blacklist: { uuid: string; name: string }[];
  }>;
  addPlayerToWhitelist: (
    id: string,
    player: { uuid: string; name: string },
  ) => Promise<void>;
  removePlayerFromWhitelist: (
    id: string,
    player: { uuid: string; name: string },
  ) => Promise<void>;
  addPlayerToBlacklist: (
    id: string,
    player: { uuid: string; name: string },
  ) => Promise<void>;
  removePlayerFromBlacklist: (
    id: string,
    player: { uuid: string; name: string },
  ) => Promise<void>;
};

export type BedrockServerAPI = {
  importServers: () => Promise<BedrockServer[]>;
  listServers: () => Promise<BedrockServer[]>;
  editServer: (id: string, updates: Partial<BedrockServer>) => Promise<boolean>;
  getServer: (id: string) => Promise<BedrockServer>;
  getServerProperties: (id: string) => Promise<Record<string, string>>;
  saveServerProperties: (
    id: string,
    properties: Record<string, unknown>,
  ) => Promise<{ ok: boolean; error?: string }>;
  start: (
    id: string,
    opts?: { port?: number; portV6?: number },
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

export type PlayerAPI = {
  fetchUUID: (username: string) => Promise<{ id?: string; error?: string }>;
};

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    exe: ExeHandler;
    mc: MinecraftServerAPI;
    bedrock: BedrockServerAPI;
    player: PlayerAPI;
  }
}

export {};

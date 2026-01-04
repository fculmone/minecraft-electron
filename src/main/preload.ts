// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
const { contextBridge, ipcRenderer } = require('electron');

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: any, ...args: any[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event: any, ...args: any[]) => func(...args));
    },
  },
  window: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
  },
};

const exeHandler = {
  run: (args: string[]) => ipcRenderer.invoke('exe:run', args),
  kill: () => ipcRenderer.invoke('exe:kill'),
  onStdout: (callback: (line: string) => void) => {
    ipcRenderer.on('exe:stdout', (_event: any, line: string) => callback(line));
  },
  onStderr: (callback: (line: string) => void) => {
    ipcRenderer.on('exe:stderr', (_event: any, line: string) => callback(line));
  },
  onExit: (callback: (code: number | null) => void) => {
    ipcRenderer.on('exe:exit', (_event: any, code: number | null) =>
      callback(code),
    );
  },
  onError: (callback: (msg: string) => void) => {
    ipcRenderer.on('exe:error', (_event: any, msg: string) => callback(msg));
  },
};

const mcHandler = {
  importServers: () => ipcRenderer.invoke('java:import'),
  listServers: () => ipcRenderer.invoke('java:list'),
  editServer: (id: string, updates: any) =>
    ipcRenderer.invoke('java:edit', { id, updates }),
  getServer: (id: string) => ipcRenderer.invoke('java:get', { id }),
  getServerProperties: (id: string) =>
    ipcRenderer.invoke('java:getServerProperties', { id }),
  saveServerProperties: (id: string, properties: Record<string, any>) =>
    ipcRenderer.invoke('java:saveServerProperties', { id, properties }),
  validate: (id: string, expectedSha256?: string) =>
    ipcRenderer.invoke('java:validate', { id, expectedSha256 }),
  start: (
    id: string,
    opts?: {
      xms?: string;
      xmx?: string;
      port?: number;
      nogui?: boolean;
      extraJvmArgs?: string[];
    },
  ) => ipcRenderer.invoke('java:start', { id, opts }),
  cmd: (id: string, cmd: string) => ipcRenderer.invoke('java:cmd', { id, cmd }),
  stop: (id: string) => ipcRenderer.invoke('java:stop', { id }),
  getRunningStatus: () => ipcRenderer.invoke('java:getRunningStatus'),
  // Backups
  getBackupSettings: (id: string) =>
    ipcRenderer.invoke('java:getBackupSettings', { id }),
  setBackupSettings: (
    id: string,
    settings: {
      enabled: boolean;
      onStart: boolean;
      maxBackups: number;
      frequencyMinutes: number;
    },
  ) => ipcRenderer.invoke('java:setBackupSettings', { id, settings }),
  listBackups: (id: string) => ipcRenderer.invoke('java:listBackups', { id }),
  createBackup: (id: string) => ipcRenderer.invoke('java:createBackup', { id }),
  deleteBackup: (id: string, backupId: string) =>
    ipcRenderer.invoke('java:deleteBackup', { id, backupId }),
  restoreBackup: (id: string, backupId: string) =>
    ipcRenderer.invoke('java:restoreBackup', { id, backupId }),
  onLog: (
    cb: (d: { id: string; line: string; stream: 'stdout' | 'stderr' }) => void,
  ) =>
    ipcRenderer.on(
      'java:log',
      (_e: any, d: { id: string; line: string; stream: 'stdout' | 'stderr' }) =>
        cb(d),
    ),
  onPlayerJoined: (
    cb: (d: { id: string; username: string; timestamp: number }) => void,
  ) =>
    ipcRenderer.on(
      'java:player-joined',
      (_e: any, d: { id: string; username: string; timestamp: number }) =>
        cb(d),
    ),
  onPlayerLeft: (
    cb: (d: { id: string; username: string; timestamp: number }) => void,
  ) =>
    ipcRenderer.on(
      'java:player-left',
      (_e: any, d: { id: string; username: string; timestamp: number }) =>
        cb(d),
    ),
  onOnlinePlayers: (cb: (d: { id: string; players: string[] }) => void) =>
    ipcRenderer.on(
      'java:online-players',
      (_e: any, d: { id: string; players: string[] }) => cb(d),
    ),
  onStatus: (
    cb: (d: {
      id: string;
      status: 'starting' | 'ready' | 'stopped' | 'error';
      message?: string;
    }) => void,
  ) =>
    ipcRenderer.on(
      'java:status',
      (
        _e: any,
        d: {
          id: string;
          status: 'starting' | 'ready' | 'stopped' | 'error';
          message?: string;
        },
      ) => cb(d),
    ),
  getWhiteAndBlacklist: (id: string) =>
    ipcRenderer.invoke('java:getWhiteAndBlacklist', { id }),
  addPlayerToWhitelist: (id: string, player: { uuid: string; name: string }) =>
    ipcRenderer.invoke('java:addPlayerToWhitelist', { id, player }),
  removePlayerFromWhitelist: (
    id: string,
    player: { uuid: string; name: string },
  ) => ipcRenderer.invoke('java:removePlayerFromWhitelist', { id, player }),
  addPlayerToBlacklist: (id: string, player: { uuid: string; name: string }) =>
    ipcRenderer.invoke('java:addPlayerToBlacklist', { id, player }),
  removePlayerFromBlacklist: (
    id: string,
    player: { uuid: string; name: string },
  ) => ipcRenderer.invoke('java:removePlayerFromBlacklist', { id, player }),
};

const bedrockHandler = {
  importServers: () => ipcRenderer.invoke('bedrock:import'),
  listServers: () => ipcRenderer.invoke('bedrock:list'),
  start: (
    id: string,
    opts?: {
      port?: number;
      portV6?: number;
    },
  ) => ipcRenderer.invoke('bedrock:start', { id, opts }),
  cmd: (id: string, cmd: string) =>
    ipcRenderer.invoke('bedrock:cmd', { id, cmd }),
  stop: (id: string) => ipcRenderer.invoke('bedrock:stop', { id }),
  onLog: (
    cb: (d: { id: string; line: string; stream: 'stdout' | 'stderr' }) => void,
  ) =>
    ipcRenderer.on(
      'bedrock:log',
      (_e: any, d: { id: string; line: string; stream: 'stdout' | 'stderr' }) =>
        cb(d),
    ),
  onStatus: (
    cb: (d: {
      id: string;
      status: 'starting' | 'ready' | 'stopped' | 'error';
      message?: string;
    }) => void,
  ) =>
    ipcRenderer.on(
      'bedrock:status',
      (
        _e: any,
        d: {
          id: string;
          status: 'starting' | 'ready' | 'stopped' | 'error';
          message?: string;
        },
      ) => cb(d),
    ),
};

const playerHandler = {
  fetchUUID: (username: string) =>
    ipcRenderer.invoke('player:fetchUUID', username),
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('exe', exeHandler);
contextBridge.exposeInMainWorld('mc', mcHandler);
contextBridge.exposeInMainWorld('bedrock', bedrockHandler);
contextBridge.exposeInMainWorld('player', playerHandler);

export type ElectronHandler = typeof electronHandler;
export type ExeHandler = typeof exeHandler;
export type PlayerHandler = typeof playerHandler;

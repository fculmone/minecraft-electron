import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import fssync from 'fs';
import crypto from 'crypto';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import unzipper from 'unzipper';
import type { ServerProperties } from './javaTypes.ts';

export type McServer = {
  id: string;
  name: string; // original file name
  dir: string; // <userData>/minecraft/<id>
  jarPath: string; // dir/server.jar
  sha256?: string;
  createdAt: string;
  lastStartedAt?: string;
  version?: string;
  port?: number;
  xms?: string;
  xmx?: string;
};

const ROOT = path.join(app.getPath('userData'), 'minecraft');
const INDEX = path.join(ROOT, 'index.json');
const running = new Map<string, ChildProcessWithoutNullStreams>();

function winFromSender(e: Electron.IpcMainInvokeEvent) {
  return BrowserWindow.fromWebContents(e.sender);
}
async function ensure(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}
async function loadIndex(): Promise<McServer[]> {
  try {
    return JSON.parse(await fs.readFile(INDEX, 'utf8'));
  } catch {
    return [];
  }
}
async function saveIndex(v: McServer[]) {
  await ensure(ROOT);
  await fs.writeFile(INDEX, JSON.stringify(v, null, 2), 'utf8');
}

async function editIndex(
  id: string,
  updates: Partial<McServer>,
): Promise<boolean> {
  try {
    const list = await loadIndex();
    const serverIndex = list.findIndex((server) => server.id === id);

    if (serverIndex === -1) {
      console.error(`Server with id ${id} not found`);
      return false;
    }

    list[serverIndex] = { ...list[serverIndex], ...updates };

    await saveIndex(list);
    console.log(`Server ${id} updated successfully`);
    return true;
  } catch (error) {
    console.error('Error editing server index:', error);
    return false;
  }
}

async function sha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    fssync
      .createReadStream(filePath)
      .on('data', (c) => h.update(c))
      .on('end', () => resolve(h.digest('hex')))
      .on('error', reject);
  });
}

async function parseManifest(jarPath: string) {
  try {
    const d = await unzipper.Open.file(jarPath);
    const mf = d.files.find(
      (f) => f.path.toUpperCase() === 'META-INF/MANIFEST.MF',
    );
    if (!mf) return {};
    const kv: Record<string, string> = {};
    for (const line of (await mf.buffer()).toString('utf8').split(/\r?\n/)) {
      const m = line.match(/^([^:]+):\s*(.+)$/);
      if (m) kv[m[1].trim()] = m[2].trim();
    }
    return kv;
  } catch {
    return {};
  }
}

async function parseVersionJson(jarPath: string): Promise<string | undefined> {
  try {
    const d = await unzipper.Open.file(jarPath);
    const versionFile = d.files.find((f) => f.path === 'version.json');
    if (!versionFile) return undefined;

    const content = (await versionFile.buffer()).toString('utf8');
    const versionData = JSON.parse(content);

    // Return the version id or name from the JSON
    return versionData.id || versionData.name || undefined;
  } catch (error) {
    console.log('Could not parse version.json:', error);
    return undefined;
  }
}

function sendStatus(win: BrowserWindow | null | undefined, d: any) {
  win?.webContents.send('java:status', d);
}
function sendLog(win: BrowserWindow | null | undefined, d: any) {
  win?.webContents.send('java:log', d);
}

ipcMain.handle('java:import', async () => {
  await ensure(ROOT);
  const res = await dialog.showOpenDialog({
    title: 'Select one or more Minecraft server.jar files',
    filters: [{ name: 'JAR', extensions: ['jar'] }],
    properties: ['openFile', 'multiSelections'],
  });
  if (res.canceled || res.filePaths.length === 0) return [];

  const list = await loadIndex();
  const out: McServer[] = [];
  for (const src of res.filePaths) {
    const id = crypto.randomUUID();
    const dir = path.join(ROOT, id);
    await ensure(dir);

    const jarPath = path.join(dir, 'server.jar');
    await fs.copyFile(src, jarPath);

    // minimal validation, has a manifest and some mc packages
    const entries: string[] = await unzipper.Open.file(jarPath)
      .then((d: unzipper.CentralDirectory) => d.files.map((f) => f.path))
      .catch(() => []);
    if (!entries.some((p) => p.toUpperCase() === 'META-INF/MANIFEST.MF')) {
      await fs.rm(dir, { recursive: true, force: true });
      continue;
    }

    const versionFromJson = await parseVersionJson(jarPath);

    const rec: McServer = {
      id,
      name: path.basename(src),
      dir,
      jarPath,
      createdAt: new Date().toISOString(),
      sha256: await sha256(jarPath),
      version: versionFromJson || undefined,
    };
    // write defaults the server expects
    await fs.writeFile(path.join(dir, 'eula.txt'), 'eula=true\n');
    await fs.writeFile(
      path.join(dir, 'server.properties'),
      'server-port=25565\nmotd=Managed by ERB app\n',
    );

    list.push(rec);
    out.push(rec);
  }
  await saveIndex(list);
  return out;
});

ipcMain.handle('java:list', async () => loadIndex());

ipcMain.handle(
  'java:edit',
  async (_e, { id, updates }: { id: string; updates: Partial<McServer> }) => {
    return await editIndex(id, updates);
  },
);

ipcMain.handle('java:removeFolder', async (_e, { id }: { id: string }) => {
  const list = await loadIndex();
  const srv = list.find((s) => s.id === id);
  if (!srv) throw new Error('Not found');
  await fs.rm(srv.dir, { recursive: true, force: true });
  list.splice(list.indexOf(srv), 1);
  await saveIndex(list);
});

ipcMain.handle('java:get', async (_e, { id }: { id: string }) => {
  const list = await loadIndex();
  const srv = list.find((s) => s.id === id);
  if (!srv) throw new Error('Not found');
  return srv;
});

ipcMain.handle(
  'java:validate',
  async (
    _e,
    { id, expectedSha256 }: { id: string; expectedSha256?: string },
  ) => {
    const list = await loadIndex();
    const srv = list.find((s) => s.id === id);
    if (!srv) throw new Error('Not found');
    const digest = await sha256(srv.jarPath);
    return {
      ok: expectedSha256
        ? digest.toLowerCase() === expectedSha256.toLowerCase()
        : true,
      sha256: digest,
    };
  },
);

ipcMain.handle(
  'java:start',
  async (
    e,
    {
      id,
      opts,
    }: {
      id: string;
      opts?: {
        xms?: string;
        xmx?: string;
        port?: number;
        nogui?: boolean;
        extraJvmArgs?: string[];
      };
    },
  ) => {
    const win = winFromSender(e);
    const list = await loadIndex();
    const srv = list.find((s) => s.id === id);
    if (!srv) throw new Error('Not found');

    // update saved options and set last started timestamp
    srv.xms = opts?.xms || srv.xms || '1G';
    srv.xmx = opts?.xmx || srv.xmx || '2G';
    srv.port = opts?.port || srv.port || 25565;
    srv.lastStartedAt = new Date().toISOString();
    await saveIndex(list);

    // keep server.properties in sync with chosen port
    const propsPath = path.join(srv.dir, 'server.properties');
    let props = '';
    try {
      props = await fs.readFile(propsPath, 'utf8');
    } catch {}
    if (/^server-port=/m.test(props))
      props = props.replace(/^server-port=.*/m, `server-port=${srv.port}`);
    else props += `\nserver-port=${srv.port}\n`;
    await fs.writeFile(propsPath, props, 'utf8');

    const args = [
      ...(opts?.extraJvmArgs || []),
      `-Xms${srv.xms}`,
      `-Xmx${srv.xmx}`,
      '-jar',
      srv.jarPath,
      ...(opts?.nogui === false ? [] : ['nogui']),
    ];

    console.log('java', args.join(' '), srv.dir);

    // Debug: Check eula.txt before starting
    const eulaPath = path.join(srv.dir, 'eula.txt');
    try {
      const eulaContent = await fs.readFile(eulaPath, 'utf8');
      console.log('EULA content before start:', JSON.stringify(eulaContent));
    } catch (err) {
      console.log('EULA file not found before start:', err);
    }

    // Find Java executable
    const javaCmd = await findJava();
    if (!javaCmd) {
      const errorMsg =
        'Java not found. Please install Java (JDK 8 or later) and ensure it is in your PATH, or set the JAVA_HOME environment variable.';
      console.log(errorMsg);
      sendStatus(win, { id: srv.id, status: 'error', message: errorMsg });
      return { ok: false, error: errorMsg };
    }

    const child = spawn(javaCmd, args, { cwd: srv.dir });
    running.set(srv.id, child);
    sendStatus(win, { id: srv.id, status: 'starting' });

    const onChunk = (buf: Buffer, stream: 'stdout' | 'stderr') => {
      for (const line of buf.toString('utf8').split(/\r?\n/)) {
        if (!line) continue;
        sendLog(win, { id: srv.id, line, stream });
        if (line.includes('Done') && line.includes('For help'))
          sendStatus(win, { id: srv.id, status: 'ready' });
      }
    };
    child.stdout.on('data', (b) => onChunk(b, 'stdout'));
    child.stderr.on('data', (b) => onChunk(b, 'stderr'));
    child.on('exit', (code) => {
      console.log('Server exited with code:', code);
      sendStatus(win, {
        id: srv.id,
        status: 'stopped',
        message: `Exited ${code}`,
      });
      running.delete(srv.id);
    });
    child.on('error', (err) => {
      console.log('Spawn error:', err);
      sendStatus(win, { id: srv.id, status: 'error', message: String(err) });
      running.delete(srv.id);
    });

    return { ok: true, pid: child.pid };
  },
);

ipcMain.handle(
  'java:cmd',
  async (_e, { id, cmd }: { id: string; cmd: string }) => {
    const p = running.get(id);
    if (!p) throw new Error('Server is not running');
    p.stdin.write(cmd.trim() + '\n');
    return { ok: true };
  },
);

ipcMain.handle('java:stop', async (_e, { id }: { id: string }) => {
  const p = running.get(id);
  if (!p) return { ok: true };
  p.stdin.write('stop\n');
  return { ok: true };
});

ipcMain.handle('java:getRunningStatus', async () => {
  const runningServers: Record<string, boolean> = {};
  for (const [id, process] of running.entries()) {
    runningServers[id] = process.exitCode === null;
  }
  return runningServers;
});

// Parse server.properties file into an object
function parseServerProperties(content: string): Record<string, any> {
  const props: Record<string, any> = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();

    // Parse value types
    if (value === 'true') props[key] = true;
    else if (value === 'false') props[key] = false;
    else if (/^-?\d+$/.test(value)) props[key] = parseInt(value, 10);
    else props[key] = value;
  }

  return props;
}

// Convert properties object back to server.properties format
function stringifyServerProperties(props: Record<string, any>): string {
  const lines: string[] = [
    '#Minecraft server properties',
    '#Generated by Minecraft Server Manager',
    '',
  ];

  for (const [key, value] of Object.entries(props)) {
    let strValue: string;
    if (typeof value === 'boolean') strValue = value ? 'true' : 'false';
    else strValue = String(value);
    lines.push(`${key}=${strValue}`);
  }

  return lines.join('\n');
}

// Get server.properties for a specific server
ipcMain.handle(
  'java:getServerProperties',
  async (_e, { id }: { id: string }) => {
    const list = await loadIndex();
    const srv = list.find((s) => s.id === id);
    if (!srv) throw new Error('Server not found');

    const propsPath = path.join(srv.dir, 'server.properties');
    try {
      const content = await fs.readFile(propsPath, 'utf8');
      return parseServerProperties(content);
    } catch (error) {
      console.error('Error reading server.properties:', error);
      // Return empty object if file doesn't exist
      return {};
    }
  },
);

// Save server.properties for a specific server
ipcMain.handle(
  'java:saveServerProperties',
  async (
    _e,
    { id, properties }: { id: string; properties: Record<string, unknown> },
  ) => {
    const list = await loadIndex();
    const srv = list.find((s) => s.id === id);
    if (!srv) throw new Error('Server not found');

    const propsPath = path.join(srv.dir, 'server.properties');
    const content = stringifyServerProperties(properties);

    try {
      await fs.writeFile(propsPath, content, 'utf8');
      console.log(`Saved server.properties for server ${id}`);
      return { ok: true };
    } catch (error) {
      console.error('Error saving server.properties:', error);
      return { ok: false, error: String(error) };
    }
  },
);

async function findJava(): Promise<string | null> {
  // Check JAVA_HOME environment variable
  if (process.env.JAVA_HOME) {
    const javaPath = path.join(
      process.env.JAVA_HOME,
      'bin',
      'java' + (process.platform === 'win32' ? '.exe' : ''),
    );
    try {
      await fs.access(javaPath);
      console.log('Found Java at:', javaPath);
      return javaPath;
    } catch {}
  }

  // For Windows, check Microsoft JDK directory
  if (process.platform === 'win32') {
    try {
      const javaDir = 'C:\\Program Files\\Microsoft';
      const entries = await fs.readdir(javaDir);
      const jdkDirs = entries
        .filter((e) => e.startsWith('jdk'))
        .sort()
        .reverse();
      if (jdkDirs.length > 0) {
        const javaPath = path.join(javaDir, jdkDirs[0], 'bin', 'java.exe');
        await fs.access(javaPath);
        return javaPath;
      }
    } catch {}
  }

  // For Windows, use PowerShell to find java
  if (process.platform === 'win32') {
    try {
      const child = spawn(
        'powershell.exe',
        ['-Command', '(Get-Command java).Source'],
        { stdio: 'pipe' },
      );
      const output = await new Promise<string>((resolve, reject) => {
        let stdout = '';
        child.stdout.on('data', (data) => (stdout += data.toString()));
        child.on('exit', (code) =>
          code === 0
            ? resolve(stdout.trim())
            : reject(new Error('Non-zero exit')),
        );
        child.on('error', reject);
      });
      if (output) {
        await fs.access(output); // Verify the path exists
        return output;
      }
    } catch {}
  }

  // For Windows, check Microsoft JDK directory
  if (process.platform === 'win32') {
    try {
      const javaDir = 'C:\\Program Files\\Microsoft';
      const entries = await fs.readdir(javaDir);
      const jdkDirs = entries
        .filter((e) => e.startsWith('jdk'))
        .sort()
        .reverse();
      if (jdkDirs.length > 0) {
        const javaPath = path.join(javaDir, jdkDirs[0], 'bin', 'java.exe');
        await fs.access(javaPath);
        return javaPath;
      }
    } catch {}
  }

  // For Linux, check common paths
  if (process.platform === 'linux') {
    const paths = ['/usr/bin/java', '/usr/local/bin/java'];
    for (const p of paths) {
      try {
        await fs.access(p);
        return p;
      } catch {}
    }
  }

  // For macOS, check common paths (can expand this if needed)
  if (process.platform === 'darwin') {
    const paths = [
      '/usr/bin/java',
      '/Library/Java/JavaVirtualMachines/Current/Contents/Home/bin/java',
    ];
    for (const p of paths) {
      try {
        await fs.access(p);
        return p;
      } catch {}
    }
  }

  // Last resort: Test if 'java' is in PATH
  try {
    const child = spawn('java', ['-version'], { stdio: 'ignore' });
    await new Promise<void>((resolve, reject) => {
      child.on('exit', (code) =>
        code === 0 ? resolve() : reject(new Error('Non-zero exit')),
      );
      child.on('error', reject);
    });
    return 'java';
  } catch {}

  return null;
}

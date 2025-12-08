import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import fssync from 'fs';
import crypto from 'crypto';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import unzipper from 'unzipper';

type BedrockServer = {
  id: string;
  name: string; // original file name
  dir: string; // <userData>/bedrock/<id>
  exePath: string; // dir/bedrock_server.exe (or bedrock_server on Linux)
  createdAt: string;
  versionGuess?: string;
  port?: number;
  portV6?: number;
};

const ROOT = path.join(app.getPath('userData'), 'bedrock');
const INDEX = path.join(ROOT, 'index.json');
const running = new Map<string, ChildProcessWithoutNullStreams>();

function winFromSender(e: Electron.IpcMainInvokeEvent) {
  return BrowserWindow.fromWebContents(e.sender);
}
async function ensure(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}
async function loadIndex(): Promise<BedrockServer[]> {
  try {
    return JSON.parse(await fs.readFile(INDEX, 'utf8'));
  } catch {
    return [];
  }
}
async function saveIndex(v: BedrockServer[]) {
  await ensure(ROOT);
  await fs.writeFile(INDEX, JSON.stringify(v, null, 2), 'utf8');
}

async function extractZip(zipPath: string, destDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fssync
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: destDir }))
      .on('close', resolve)
      .on('error', reject);
  });
}

async function parseServerProperties(
  propsPath: string,
): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(propsPath, 'utf8');
    const props: Record<string, string> = {};
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        props[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
      }
    }
    return props;
  } catch {
    return {};
  }
}

async function updateServerProperties(
  propsPath: string,
  updates: Record<string, string>,
): Promise<void> {
  let content = '';
  try {
    content = await fs.readFile(propsPath, 'utf8');
  } catch {}

  let modified = content;
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(modified)) {
      modified = modified.replace(regex, `${key}=${value}`);
    } else {
      modified += `\n${key}=${value}\n`;
    }
  }

  await fs.writeFile(propsPath, modified, 'utf8');
}

function sendStatus(win: BrowserWindow | null | undefined, d: any) {
  win?.webContents.send('bedrock:status', d);
}
function sendLog(win: BrowserWindow | null | undefined, d: any) {
  win?.webContents.send('bedrock:log', d);
}

ipcMain.handle('bedrock:import', async () => {
  await ensure(ROOT);
  const res = await dialog.showOpenDialog({
    title: 'Select one or more Bedrock server ZIP files',
    filters: [{ name: 'ZIP', extensions: ['zip'] }],
    properties: ['openFile', 'multiSelections'],
  });
  if (res.canceled || res.filePaths.length === 0) return [];

  const list = await loadIndex();
  const out: BedrockServer[] = [];

  for (const src of res.filePaths) {
    const id = crypto.randomUUID();
    const dir = path.join(ROOT, id);
    await ensure(dir);

    try {
      // Extract ZIP to server directory
      await extractZip(src, dir);

      // Determine the executable name based on platform
      const exeName =
        process.platform === 'win32' ? 'bedrock_server.exe' : 'bedrock_server';
      const exePath = path.join(dir, exeName);

      // Validate that the executable exists
      try {
        await fs.access(exePath);
      } catch {
        // Cleanup if invalid
        await fs.rm(dir, { recursive: true, force: true });
        console.log(`Invalid Bedrock server ZIP (no ${exeName}):`, src);
        continue;
      }

      // Make executable on Unix-like systems
      if (process.platform !== 'win32') {
        await fs.chmod(exePath, 0o755);
      }

      // Try to guess version from folder name or release-notes.txt
      let versionGuess: string | undefined;
      try {
        const releaseNotes = await fs.readFile(
          path.join(dir, 'release-notes.txt'),
          'utf8',
        );
        const versionMatch = releaseNotes.match(/Version\s+([\d.]+)/i);
        if (versionMatch) versionGuess = versionMatch[1];
      } catch {}

      const rec: BedrockServer = {
        id,
        name: path.basename(src, '.zip'),
        dir,
        exePath,
        createdAt: new Date().toISOString(),
        versionGuess,
      };

      list.push(rec);
      out.push(rec);
    } catch (err) {
      console.error('Failed to import Bedrock server:', err);
      // Cleanup on error
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch {}
    }
  }

  await saveIndex(list);
  return out;
});

ipcMain.handle('bedrock:list', async () => loadIndex());

ipcMain.handle(
  'bedrock:start',
  async (
    e,
    {
      id,
      opts,
    }: {
      id: string;
      opts?: {
        port?: number;
        portV6?: number;
      };
    },
  ) => {
    const win = winFromSender(e);
    const list = await loadIndex();
    const srv = list.find((s) => s.id === id);
    if (!srv) throw new Error('Server not found');

    // Update saved options
    srv.port = opts?.port || srv.port || 19132;
    srv.portV6 = opts?.portV6 || srv.portV6 || 19133;
    await saveIndex(list);

    // Update server.properties with chosen ports
    const propsPath = path.join(srv.dir, 'server.properties');
    await updateServerProperties(propsPath, {
      'server-port': String(srv.port),
      'server-portv6': String(srv.portV6),
    });

    console.log('Starting Bedrock server:', srv.exePath, 'in', srv.dir);

    // Spawn the Bedrock server
    // On Linux, we need to set LD_LIBRARY_PATH=. for the shared libraries
    const env = { ...process.env };
    if (process.platform !== 'win32') {
      env.LD_LIBRARY_PATH = srv.dir;
    }

    const child = spawn(srv.exePath, [], { cwd: srv.dir, env });
    running.set(srv.id, child);
    sendStatus(win, { id: srv.id, status: 'starting' });

    const onChunk = (buf: Buffer, stream: 'stdout' | 'stderr') => {
      for (const line of buf.toString('utf8').split(/\r?\n/)) {
        if (!line) continue;
        sendLog(win, { id: srv.id, line, stream });
        // Bedrock server ready indicator
        if (
          line.includes('Server started') ||
          line.includes('IPv4 supported')
        ) {
          sendStatus(win, { id: srv.id, status: 'ready' });
        }
      }
    };

    child.stdout.on('data', (b) => onChunk(b, 'stdout'));
    child.stderr.on('data', (b) => onChunk(b, 'stderr'));
    child.on('exit', (code) => {
      console.log('Bedrock server exited with code:', code);
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
  'bedrock:cmd',
  async (_e, { id, cmd }: { id: string; cmd: string }) => {
    const p = running.get(id);
    if (!p) throw new Error('Server is not running');
    p.stdin.write(cmd.trim() + '\n');
    return { ok: true };
  },
);

ipcMain.handle('bedrock:stop', async (_e, { id }: { id: string }) => {
  const p = running.get(id);
  if (!p) return { ok: true };
  p.stdin.write('stop\n');
  return { ok: true };
});

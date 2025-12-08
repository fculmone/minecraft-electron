import { BrowserWindow, ipcMain } from 'electron';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { getPlayItPath } from '../paths';

let child: ChildProcessWithoutNullStreams | null = null;

export function registerExeIPC(win: BrowserWindow) {
  ipcMain.handle('exe:run', async (_e, args: string[]) => {
    if (child) throw new Error('Process is already running');

    const exe = getPlayItPath();
    child = spawn(exe, args, { windowsHide: true, cwd: path.dirname(exe) });

    child.stdout.on('data', (buf) => {
      win.webContents.send('exe:stdout', buf.toString());
    });
    child.stderr.on('data', (buf) => {
      win.webContents.send('exe:stderr', buf.toString());
    });
    child.on('close', (code) => {
      win.webContents.send('exe:exit', code);
      child = null;
    });
    child.on('error', (err) => {
      win.webContents.send('exe:error', String(err));
    });

    return { started: true };
  });

  ipcMain.handle('exe:kill', async () => {
    if (!child) return { running: false };
    child.kill();
    return { running: false };
  });
}

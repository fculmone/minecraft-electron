import path from 'node:path';
import { app } from 'electron';

export function getPlayItPath() {
  const devPath = path.join(
    app.getAppPath(),
    'assets',
    'bin',
    'win',
    'playit-windows-x86_64-signed.exe',
  );
  const prodPath = path.join(
    process.resourcesPath,
    'bin',
    'playit-windows-x86_64-signed.exe',
  );
  return app.isPackaged ? prodPath : devPath;
}

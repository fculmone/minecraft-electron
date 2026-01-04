import { ipcMain } from 'electron';

type LookupResult = { id?: string; error?: 'not_found' | 'network' };

async function fetchFromMojang(username: string): Promise<LookupResult> {
  const res = await fetch(
    `https://api.mojang.com/users/profiles/minecraft/${username}`,
  );
  if (res.status === 404 || res.status === 400) return { error: 'not_found' };
  if (!res.ok) throw new Error('http_error');
  const data = await res.json();
  return { id: data.id };
}

export function registerPlayerLookupIPC() {
  ipcMain.handle('player:fetchUUID', async (_e, username: string) => {
    try {
      return await fetchFromMojang(username);
    } catch (err) {
      return { error: 'network' };
    }
  });
}

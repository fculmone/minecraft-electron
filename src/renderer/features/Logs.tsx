import { useEffect, useState } from 'react';

export default function Logs() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    window.exe.onStdout((l) => setLines((x) => [...x, l]));
    window.exe.onStderr((l) => setLines((x) => [...x, `[ERR] ${l}`]));
    window.exe.onExit((code) => setLines((x) => [...x, `Exited with ${code}`]));
    window.exe.onError((msg) => setLines((x) => [...x, `Error: ${msg}`]));
  }, []);

  return (
    <div>
      <button onClick={() => window.exe.run([])}>Run</button>
      <button onClick={() => window.exe.kill()}>Stop</button>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{lines.join('')}</pre>
    </div>
  );
}

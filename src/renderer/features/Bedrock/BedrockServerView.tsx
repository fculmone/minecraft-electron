import React, { useEffect, useState } from 'react';

export default function BedrockServerView() {
  const [servers, setServers] = useState<any[]>([]);
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    window.bedrock.onLog((d: any) => {
      setLogs((prev) => {
        const next = { ...prev };
        const arr = next[d.id] || [];
        arr.push(`${d.stream === 'stderr' ? '[err] ' : ''}${d.line}`);
        next[d.id] = arr.slice(-2000);
        return next;
      });
    });
    window.bedrock.onStatus((d: any) => {
      setStatus((prev) => ({ ...prev, [d.id]: d.status }));
    });
    refresh();
  }, []);

  async function refresh() {
    setServers(await window.bedrock.listServers());
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 16,
        padding: 16,
      }}
    >
      <div>
        <button
          onClick={async () => {
            await window.bedrock.importServers();
            await refresh();
          }}
        >
          Import Bedrock ZIP files
        </button>
        <ul>
          {servers.map((s) => (
            <li key={s.id} style={{ marginTop: 12 }}>
              <div>
                <b>{s.name}</b>
              </div>
              <div>
                ID {s.id.slice(0, 8)} • Status {status[s.id] || 'idle'}
              </div>
              {s.versionGuess && <div>Version: {s.versionGuess}</div>}
              <div>Port: {s.port || 19132}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button
                  onClick={() =>
                    window.bedrock.start(s.id, {
                      port: 19132,
                      portV6: 19133,
                    })
                  }
                >
                  Start
                </button>
                <button onClick={() => window.bedrock.cmd(s.id, 'list')}>
                  list
                </button>
                <button onClick={() => window.bedrock.stop(s.id)}>Stop</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {servers.map((s) => (
          <div
            key={s.id}
            style={{ border: '1px solid #ccc', padding: 8, marginBottom: 12 }}
          >
            <div style={{ fontWeight: 600 }}>{s.name}</div>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                height: 220,
                overflow: 'auto',
                marginTop: 8,
              }}
            >
              {(logs[s.id] || []).join('\n')}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface JavaServerIndexEntry {
  id: string;
  name: string;
  dir: string;
  jarPath: string;
  createdAt: string;
  sha256: string;
  xms: string;
  xmx: string;
  port: number;
}

// Minecraft server.properties types
// Core literal types
type GameMode = 'survival' | 'creative' | 'adventure' | 'spectator';
type Difficulty = 'peaceful' | 'easy' | 'normal' | 'hard';
type LevelType =
  | 'minecraft:normal'
  | 'minecraft:flat'
  | 'minecraft:amplified'
  | 'minecraft:large_biomes';
type RegionCompression = 'deflate' | 'zstd' | 'none';

/** Full schema for server.properties */
export interface ServerProperties {
  /** Accepts player transfer handshakes. Example: false */
  'accepts-transfers': boolean;

  /** Allow flying on the server. Example: false */
  'allow-flight': boolean;

  /** Send console messages to ops. Example: true */
  'broadcast-console-to-ops': boolean;

  /** Send RCON messages to ops. Example: true */
  'broadcast-rcon-to-ops': boolean;

  /** URL for bug reports shown to players. Example: "" */
  'bug-report-link': string;

  /** World difficulty. Example: "easy" */
  difficulty: Difficulty;

  /** Show code of conduct prompt. Example: false */
  'enable-code-of-conduct': boolean;

  /** Enable JMX monitoring for Java tools. Example: false */
  'enable-jmx-monitoring': boolean;

  /** Enable GameSpy query protocol. Example: false */
  'enable-query': boolean;

  /** Enable remote console. Example: false */
  'enable-rcon': boolean;

  /** Allow status pings from clients. Example: true */
  'enable-status': boolean;

  /** Require secure chat profiles. Example: true */
  'enforce-secure-profile': boolean;

  /** Enforce whitelist even if white-list=false. Example: false */
  'enforce-whitelist': boolean;

  /** Percentage scale for entity broadcast ranges. Example: 100 */
  'entity-broadcast-range-percentage': number;

  /** Force players into default gamemode on join. Example: false */
  'force-gamemode': boolean;

  /** Permission level used by /function. 1..4, Example: 2 */
  'function-permission-level': 1 | 2 | 3 | 4;

  /** Default gamemode for new players. Example: "survival" */
  gamemode: GameMode;

  /** Generate structures like villages. Example: true */
  'generate-structures': boolean;

  /** Custom generator settings JSON. Example: "{}" */
  'generator-settings': string;

  /** Hardcore mode. Example: false */
  hardcore: boolean;

  /** Hide player list from server status. Example: false */
  'hide-online-players': boolean;

  /** Comma separated data pack IDs to disable on first load. Example: "" */
  'initial-disabled-packs': string;

  /** Comma separated data pack IDs to enable on first load. Example: "vanilla" */
  'initial-enabled-packs': string;

  /** Folder name for the world save. Example: "world" */
  'level-name': string;

  /** Custom world seed. Example: "" or "123456" */
  'level-seed': string;

  /** World generator type. Example: "minecraft:normal" */
  'level-type': LevelType;

  /** Log connecting player IPs. Example: true */
  'log-ips': boolean;

  /** Enable the management API server. Example: false */
  'management-server-enabled': boolean;

  /** Host for management API. Example: "localhost" */
  'management-server-host': string;

  /** Port for management API. 0 means auto choose. Example: 0 */
  'management-server-port': number;

  /** Bearer secret for management API. Example: "..." */
  'management-server-secret': string;

  /** Use TLS on management API. Example: true */
  'management-server-tls-enabled': boolean;

  /** Path to TLS keystore for management API. Example: "" */
  'management-server-tls-keystore': string;

  /** Password for TLS keystore. Example: "" */
  'management-server-tls-keystore-password': string;

  /** Cap on chained neighbor updates per tick. Example: 1000000 */
  'max-chained-neighbor-updates': number;

  /** Max concurrent players. Example: 20 */
  'max-players': number;

  /** Watchdog max tick length in ms, 0 disables. Example: 60000 */
  'max-tick-time': number;

  /** World border radius limit. Example: 29999984 */
  'max-world-size': number;

  /** Server list message of the day. Example: "Managed by ERB app" */
  motd: string;

  /** Packet compression threshold in bytes, -1 disables. Example: 256 */
  'network-compression-threshold': number;

  /** Use Mojang authentication. Example: true */
  'online-mode': boolean;

  /** Operator command permission level. 1..4, Example: 4 */
  'op-permission-level': 1 | 2 | 3 | 4;

  /** Pause server when empty for N seconds, 0 disables. Example: 60 */
  'pause-when-empty-seconds': number;

  /** Kick idle players after N minutes, 0 disables. Example: 0 */
  'player-idle-timeout': number;

  /** Block connections via proxies or VPNs. Example: false */
  'prevent-proxy-connections': boolean;

  /** GameSpy query port. Example: 25565 */
  'query.port': number;

  /** Per IP connection rate limit per second, 0 disables. Example: 0 */
  'rate-limit': number;

  /** RCON password, empty disables. Example: "" */
  'rcon.password': string;

  /** RCON port. Example: 25575 */
  'rcon.port': number;

  /** Region file compression algorithm. Example: "deflate" */
  'region-file-compression': RegionCompression;

  /** Require clients to accept resource pack. Example: false */
  'require-resource-pack': boolean;

  /** Resource pack URL. Example: "" or "https://example.com/pack.zip" */
  'resource-pack': string;

  /** Internal resource pack ID. Example: "" */
  'resource-pack-id': string;

  /** Prompt shown when asking to apply the pack. Example: "" */
  'resource-pack-prompt': string;

  /** SHA1 of the resource pack file. Example: "" */
  'resource-pack-sha1': string;

  /** Bind IP, empty means all interfaces. Example: "" */
  'server-ip': string;

  /** Server listen port. Example: 25565 */
  'server-port': number;

  /** Simulation radius in chunks. Example: 10 */
  'simulation-distance': number;

  /** Spawn protection radius in blocks, 0 disables. Example: 16 */
  'spawn-protection': number;

  /** Interval in ticks to send status heartbeats, 0 disables. Example: 0 */
  'status-heartbeat-interval': number;

  /** Write chunks synchronously to disk. Example: true */
  'sync-chunk-writes': boolean;

  /** URL or path to chat filtering config. Example: "" */
  'text-filtering-config': string;

  /** Chat filtering rules version. Example: 0 */
  'text-filtering-version': number;

  /** Use OS native networking transport. Example: true */
  'use-native-transport': boolean;

  /** Client view distance in chunks. Example: 10 */
  'view-distance': number;

  /** Use whitelist file to restrict access. Example: false */
  'white-list': boolean;
}

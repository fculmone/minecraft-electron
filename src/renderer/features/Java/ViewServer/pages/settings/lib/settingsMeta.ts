// configMeta.ts
import type { ServerProperties } from '@main/minecraftServers/javaTypes';

export type TabId =
  | 'core'
  | 'world'
  | 'performance'
  | 'security'
  | 'comms'
  | 'resources'
  | 'admin'
  | 'misc';

export const TABS: { id: TabId; label: string }[] = [
  { id: 'core', label: 'Core' },
  { id: 'world', label: 'World' },
  { id: 'performance', label: 'Performance' },
  { id: 'security', label: 'Security' },
  { id: 'comms', label: 'Comms & Logging' },
  { id: 'resources', label: 'Resource Packs' },
  { id: 'admin', label: 'Admin & Monitoring' },
  { id: 'misc', label: 'Advanced' },
];

// which fields belong to which tab
export const TAB_FIELDS: Record<TabId, (keyof ServerProperties)[]> = {
  core: [
    'gamemode',
    'difficulty',
    'max-players',
    'online-mode',
    'level-name',
    'motd',
    'spawn-protection',
    'white-list',
    'force-gamemode',
    'server-port',
  ],
  world: [
    'generate-structures',
    'level-type',
    'level-seed',
    'hardcore',
    'max-world-size',
    'simulation-distance',
    'view-distance',
    'gamemode',
    'difficulty',
  ],
  performance: [
    'max-tick-time',
    'network-compression-threshold',
    'rate-limit',
    'use-native-transport',
    'sync-chunk-writes',
    'entity-broadcast-range-percentage',
    'pause-when-empty-seconds',
  ],
  security: [
    'enforce-whitelist',
    'enforce-secure-profile',
    'prevent-proxy-connections',
    'op-permission-level',
    'allow-flight',
  ],
  comms: [
    'broadcast-console-to-ops',
    'broadcast-rcon-to-ops',
    'log-ips',
    'enable-query',
    'query.port',
    'enable-rcon',
    'rcon.port',
    'rcon.password',
  ],
  resources: [
    'require-resource-pack',
    'resource-pack',
    'resource-pack-prompt',
    'resource-pack-sha1',
    'resource-pack-id',
  ],
  admin: [
    'enable-jmx-monitoring',
    'enable-status',
    'management-server-enabled',
    'management-server-port',
    'management-server-host',
    'management-server-tls-enabled',
  ],
  misc: [
    'accepts-transfers',
    'bug-report-link',
    'max-chained-neighbor-updates',
    'region-file-compression',
    'text-filtering-config',
    'text-filtering-version',
    'generator-settings',
    'hide-online-players',
    'initial-disabled-packs',
    'initial-enabled-packs',
    'server-ip',
    'status-heartbeat-interval',
  ],
};

// description and example for each property
type PropertyMeta = {
  label: string;
  description: string;
  example?: string;
  // you can also add allowedValues, type hints, etc
  allowedValues?: readonly string[];
  min?: number;
  max?: number;
};

export const PROPERTY_META: { [K in keyof ServerProperties]: PropertyMeta } = {
  'accepts-transfers': {
    label: 'Accepts Transfers',
    description: 'Accepts player transfer handshakes from other servers.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'allow-flight': {
    label: 'Allow Flight',
    description:
      'Allow flying on the server. Setting to false will kick flying players.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'broadcast-console-to-ops': {
    label: 'Broadcast Console to Ops',
    description: 'Send console messages to online operators.',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'broadcast-rcon-to-ops': {
    label: 'Broadcast RCON to Ops',
    description: 'Send RCON messages to online operators.',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'bug-report-link': {
    label: 'Bug Report Link',
    description: 'URL for bug reports shown to players.',
    example: '',
  },
  difficulty: {
    label: 'Difficulty',
    description: 'Overall challenge level.',
    allowedValues: ['peaceful', 'easy', 'normal', 'hard'],
    example: 'easy',
  },
  'enable-code-of-conduct': {
    label: 'Enable Code of Conduct',
    description: 'Show code of conduct prompt to players.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'enable-jmx-monitoring': {
    label: 'Enable JMX Monitoring',
    description: 'Enable JMX monitoring for Java management tools.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'enable-query': {
    label: 'Enable Query',
    description: 'Enable GameSpy query protocol for server info.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'enable-rcon': {
    label: 'Enable RCON',
    description: 'Enable remote console for server commands.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'enable-status': {
    label: 'Enable Status',
    description: 'Allow status pings from clients for server list.',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'enforce-secure-profile': {
    label: 'Enforce Secure Profile',
    description: 'Require secure chat profiles (cryptographically signed).',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'enforce-whitelist': {
    label: 'Enforce Whitelist',
    description: 'Enforce whitelist even if white-list is set to false.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'entity-broadcast-range-percentage': {
    label: 'Entity Broadcast Range %',
    description:
      'Percentage scale for entity broadcast ranges. 100 is default.',
    example: '100',
    min: 10,
    max: 1000,
  },
  'force-gamemode': {
    label: 'Force Gamemode',
    description: 'Force players into default gamemode on join.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'function-permission-level': {
    label: 'Function Permission Level',
    description: 'Permission level used by /function command (1-4).',
    allowedValues: ['1', '2', '3', '4'],
    example: '2',
  },
  gamemode: {
    label: 'Gamemode',
    description: 'Default game mode for new players.',
    allowedValues: ['survival', 'creative', 'adventure', 'spectator'],
    example: 'survival',
  },
  'generate-structures': {
    label: 'Generate Structures',
    description: 'Generate structures like villages, temples, etc.',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'generator-settings': {
    label: 'Generator Settings',
    description: 'Custom generator settings in JSON format.',
    example: '{}',
  },
  hardcore: {
    label: 'Hardcore',
    description: 'Enable hardcore mode (permanent death).',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'hide-online-players': {
    label: 'Hide Online Players',
    description: 'Hide player list from server status.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'initial-disabled-packs': {
    label: 'Initial Disabled Packs',
    description: 'Comma separated data pack IDs to disable on first load.',
    example: '',
  },
  'initial-enabled-packs': {
    label: 'Initial Enabled Packs',
    description: 'Comma separated data pack IDs to enable on first load.',
    example: 'vanilla',
  },
  'level-name': {
    label: 'Level Name',
    description: 'Folder name for the world save.',
    example: 'world',
  },
  'level-seed': {
    label: 'Level Seed',
    description: 'Custom world seed for world generation.',
    example: '',
  },
  'level-type': {
    label: 'Level Type',
    description: 'World generator type.',
    allowedValues: [
      'minecraft:normal',
      'minecraft:flat',
      'minecraft:amplified',
      'minecraft:large_biomes',
    ],
    example: 'minecraft:normal',
  },
  'log-ips': {
    label: 'Log IPs',
    description: 'Log connecting player IP addresses.',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'management-server-enabled': {
    label: 'Management Server Enabled',
    description: 'Enable the management API server.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'management-server-host': {
    label: 'Management Server Host',
    description: 'Host for management API.',
    example: 'localhost',
  },
  'management-server-port': {
    label: 'Management Server Port',
    description: 'Port for management API. 0 means auto choose.',
    example: '0',
    min: 0,
    max: 65535,
  },
  'management-server-secret': {
    label: 'Management Server Secret',
    description: 'Bearer secret for management API authentication.',
    example: '',
  },
  'management-server-tls-enabled': {
    label: 'Management Server TLS',
    description: 'Use TLS on management API.',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'management-server-tls-keystore': {
    label: 'Management TLS Keystore',
    description: 'Path to TLS keystore for management API.',
    example: '',
  },
  'management-server-tls-keystore-password': {
    label: 'Management TLS Keystore Password',
    description: 'Password for TLS keystore.',
    example: '',
  },
  'max-chained-neighbor-updates': {
    label: 'Max Chained Neighbor Updates',
    description: 'Cap on chained neighbor updates per tick.',
    example: '1000000',
    min: 0,
    max: 2147483647,
  },
  'max-players': {
    label: 'Max Players',
    description: 'Maximum concurrent players.',
    example: '20',
    min: 1,
    max: 2147483647,
  },
  'max-tick-time': {
    label: 'Max Tick Time',
    description: 'Watchdog max tick length in ms, 0 disables.',
    example: '60000',
    min: -1,
    max: 2147483647,
  },
  'max-world-size': {
    label: 'Max World Size',
    description: 'World border radius limit in blocks.',
    example: '29999984',
    min: 1,
    max: 29999984,
  },
  motd: {
    label: 'MOTD',
    description: 'Server list message of the day.',
    example: 'A Minecraft Server',
  },
  'network-compression-threshold': {
    label: 'Network Compression Threshold',
    description: 'Packet compression threshold in bytes, -1 disables.',
    example: '256',
    min: -1,
    max: 2147483647,
  },
  'online-mode': {
    label: 'Online Mode',
    description: 'Use Mojang authentication on player login.',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'op-permission-level': {
    label: 'Op Permission Level',
    description: 'Operator command permission level (1-4).',
    allowedValues: ['1', '2', '3', '4'],
    example: '4',
  },
  'pause-when-empty-seconds': {
    label: 'Pause When Empty',
    description: 'Pause server when empty for N seconds, 0 disables.',
    example: '60',
    min: 0,
    max: 2147483647,
  },
  'player-idle-timeout': {
    label: 'Player Idle Timeout',
    description: 'Kick idle players after N minutes, 0 disables.',
    example: '0',
    min: 0,
    max: 2147483647,
  },
  'prevent-proxy-connections': {
    label: 'Prevent Proxy Connections',
    description: 'Block connections via proxies or VPNs.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'query.port': {
    label: 'Query Port',
    description: 'GameSpy query protocol port.',
    example: '25565',
    min: 1,
    max: 65535,
  },
  'rate-limit': {
    label: 'Rate Limit',
    description: 'Per IP connection rate limit per second, 0 disables.',
    example: '0',
    min: 0,
    max: 2147483647,
  },
  'rcon.password': {
    label: 'RCON Password',
    description: 'RCON password, empty disables.',
    example: '',
  },
  'rcon.port': {
    label: 'RCON Port',
    description: 'RCON port.',
    example: '25575',
    min: 1,
    max: 65535,
  },
  'region-file-compression': {
    label: 'Region File Compression',
    description: 'Region file compression algorithm.',
    allowedValues: ['deflate', 'zstd', 'none'],
    example: 'deflate',
  },
  'require-resource-pack': {
    label: 'Require Resource Pack',
    description: 'Require clients to accept resource pack.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
  'resource-pack': {
    label: 'Resource Pack',
    description: 'Resource pack URL.',
    example: '',
  },
  'resource-pack-id': {
    label: 'Resource Pack ID',
    description: 'Internal resource pack ID.',
    example: '',
  },
  'resource-pack-prompt': {
    label: 'Resource Pack Prompt',
    description: 'Prompt shown when asking to apply the pack.',
    example: '',
  },
  'resource-pack-sha1': {
    label: 'Resource Pack SHA1',
    description: 'SHA1 hash of the resource pack file.',
    example: '',
  },
  'server-ip': {
    label: 'Server IP',
    description: 'Bind IP address, empty means all interfaces.',
    example: '',
  },
  'server-port': {
    label: 'Server Port',
    description: 'Server listen port.',
    example: '25565',
    min: 1,
    max: 65535,
  },
  'simulation-distance': {
    label: 'Simulation Distance',
    description: 'Simulation radius in chunks.',
    example: '10',
    min: 3,
    max: 32,
  },
  'spawn-protection': {
    label: 'Spawn Protection',
    description: 'Spawn protection radius in blocks, 0 disables.',
    example: '16',
    min: 0,
    max: 29999984,
  },
  'status-heartbeat-interval': {
    label: 'Status Heartbeat Interval',
    description: 'Interval in ticks to send status heartbeats, 0 disables.',
    example: '0',
    min: 0,
    max: 2147483647,
  },
  'sync-chunk-writes': {
    label: 'Sync Chunk Writes',
    description: 'Write chunks synchronously to disk.',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'text-filtering-config': {
    label: 'Text Filtering Config',
    description: 'URL or path to chat filtering config.',
    example: '',
  },
  'text-filtering-version': {
    label: 'Text Filtering Version',
    description: 'Chat filtering rules version.',
    example: '0',
    min: 0,
    max: 2147483647,
  },
  'use-native-transport': {
    label: 'Use Native Transport',
    description: 'Use OS native networking transport (epoll/kqueue).',
    allowedValues: ['true', 'false'],
    example: 'true',
  },
  'view-distance': {
    label: 'View Distance',
    description: 'Client view distance in chunks.',
    example: '10',
    min: 3,
    max: 32,
  },
  'white-list': {
    label: 'Whitelist',
    description: 'Use whitelist file to restrict access.',
    allowedValues: ['true', 'false'],
    example: 'false',
  },
};

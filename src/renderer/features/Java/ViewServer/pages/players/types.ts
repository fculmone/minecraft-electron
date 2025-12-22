export interface Player {
  uuid: string;
  username: string;
  lastSeen?: Date;
  isOnline?: boolean;
  isWhitelisted?: boolean;
  isBanned?: boolean;
}

import { MinecraftServerAPI } from '@renderer/preload';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaBan } from 'react-icons/fa';
import { PlayerCard, AddPlayerModal } from './components';
import type { Player } from './types';

declare global {
  interface Window {
    mc: MinecraftServerAPI;
    player: {
      fetchUUID: (username: string) => Promise<{ id?: string; error?: string }>;
    };
  }
}

interface PlayersProps {
  isServerRunning: boolean;
}

export default function Players({ isServerRunning }: PlayersProps) {
  const { id } = useParams<{ id: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<Set<string>>(new Set());
  const [whitelistedPlayers, setWhitelistedPlayers] = useState<Set<string>>(
    new Set(),
  );
  const [bannedPlayers, setBannedPlayers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<
    'all' | 'online' | 'whitelisted' | 'banned'
  >('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [restrictionMode, setRestrictionMode] = useState<
    'whitelist' | 'blacklist'
  >('blacklist');

  const storageKey = id ? `players-${id}` : null;

  // Load initial state
  useEffect(() => {
    if (!storageKey) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setPlayers(
          data.players.map((p: any) => ({
            ...p,
            lastSeen: p.lastSeen ? new Date(p.lastSeen) : undefined,
          })),
        );
      }

      window.mc.getWhiteAndBlacklist(id!).then(({ whitelist, blacklist }) => {
        setWhitelistedPlayers(new Set(whitelist.map((p) => p.name)));
        setBannedPlayers(new Set(blacklist.map((p) => p.name)));
        whitelist.map((p) => {
          const exists = players.some(
            (pl) => pl.username.toLowerCase() === p.name.toLowerCase(),
          );
          if (!exists) {
            setPlayers((prev) => [
              ...prev,
              { uuid: p.uuid, username: p.name, lastSeen: undefined },
            ]);
          }
        });
        blacklist.map((p) => {
          const exists = players.some(
            (pl) => pl.username.toLowerCase() === p.name.toLowerCase(),
          );
          if (!exists) {
            setPlayers((prev) => [
              ...prev,
              { uuid: p.uuid, username: p.name, lastSeen: undefined },
            ]);
          }
        });
      });

      window.mc.getServerProperties(id!).then((props) => {
        if (props['white-list'] === true) {
          setRestrictionMode('whitelist');
        } else {
          setRestrictionMode('blacklist');
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading players:', error);
      setLoading(false);
    }
  }, [storageKey]);

  // Use Effect to update restriction mode in server properties
  useEffect(() => {
    if (!id) return;

    window.mc.getServerProperties(id).then((props) => {
      const updatedProps = {
        ...props,
        'white-list': restrictionMode === 'whitelist',
      };
      window.mc.saveServerProperties(id, updatedProps);
    });
  }, [restrictionMode, id]);

  // Save players to localStorage
  useEffect(() => {
    if (!storageKey) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          players,
        }),
      );
      window.mc.getWhiteAndBlacklist(id!).then(({ whitelist, blacklist }) => {
        setWhitelistedPlayers(new Set(whitelist.map((p) => p.name)));
        setBannedPlayers(new Set(blacklist.map((p) => p.name)));
      });
    } catch (error) {
      console.error('Error saving players:', error);
    }
  }, [players]);

  // Listen for player join/leave events and online players list
  useEffect(() => {
    if (!id) return;

    // Clear online players when server stops
    if (!isServerRunning) {
      setOnlinePlayers(new Set());
      return;
    }

    // Request current online players when server starts
    window.mc.cmd(id, 'list');

    const handlePlayerJoined = async (data: {
      id: string;
      username: string;
      timestamp: number;
    }) => {
      if (data.id !== id) return;

      setOnlinePlayers((prev) => new Set(prev).add(data.username));

      const playerUUID = await window.player.fetchUUID(data.username.trim());
      console.log('Lookup result:', playerUUID);

      if (typeof playerUUID === 'object' && playerUUID.error) {
        console.error(
          `Error looking up UUID for ${data.username}: ${playerUUID.error}`,
        );
        return;
      }
      if (!playerUUID.id) {
        console.error(`No UUID found for ${data.username}`);
        return;
      }

      setPlayers((prev) => {
        const existing = prev.find((p) => p.username === data.username);
        if (existing) {
          return prev.map((p) =>
            p.username === data.username
              ? { ...p, lastSeen: new Date(data.timestamp) }
              : p,
          );
        }

        return [
          ...prev,
          {
            uuid: playerUUID.id || '',
            username: data.username,
            lastSeen: new Date(data.timestamp),
          },
        ];
      });
    };

    const handlePlayerLeft = (data: {
      id: string;
      username: string;
      timestamp: number;
    }) => {
      if (data.id !== id) return;

      setOnlinePlayers((prev) => {
        const next = new Set(prev);
        next.delete(data.username);
        return next;
      });

      setPlayers((prev) =>
        prev.map((p) =>
          p.username === data.username
            ? { ...p, lastSeen: new Date(data.timestamp) }
            : p,
        ),
      );
    };

    const handleOnlinePlayers = (data: { id: string; players: string[] }) => {
      if (data.id !== id) return;
      setOnlinePlayers(new Set(data.players));
    };

    window.mc.onPlayerJoined(handlePlayerJoined);
    window.mc.onPlayerLeft(handlePlayerLeft);
    window.mc.onOnlinePlayers(handleOnlinePlayers);
  }, [id, isServerRunning]);

  const filteredPlayers = players.filter((player) => {
    let matches = true;

    // Apply filter type
    if (filterType === 'online') {
      matches = onlinePlayers.has(player.username);
    } else if (filterType === 'whitelisted') {
      matches = whitelistedPlayers.has(player.username);
    } else if (filterType === 'banned') {
      matches = bannedPlayers.has(player.username);
    }

    // Apply search term
    if (
      searchTerm &&
      !player.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      matches = false;
    }

    return matches;
  });

  const handleToggleWhitelist = (uuid: string, username: string) => {
    const isCurrentlyWhitelisted = whitelistedPlayers.has(username);
    console.log(
      `Toggling whitelist for ${username} ${uuid}: currently ${
        isCurrentlyWhitelisted ? 'whitelisted' : 'not whitelisted'
      }`,
    );

    setWhitelistedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });

    // Update whitelist on server
    if (id) {
      if (isCurrentlyWhitelisted) {
        window.mc.removePlayerFromWhitelist(id, { uuid, name: username });
      } else {
        window.mc.addPlayerToWhitelist(id, { uuid, name: username });
      }
    }
  };

  const handleToggleBan = (uuid: string, username: string) => {
    const isCurrentlyBanned = bannedPlayers.has(username);
    console.log(
      `Toggling ban for ${username} ${uuid}: currently ${
        isCurrentlyBanned ? 'banned' : 'not banned'
      }`,
    );

    setBannedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });

    // Update whitelist/blacklist on server
    if (id) {
      if (isCurrentlyBanned) {
        window.mc.removePlayerFromBlacklist(id, { uuid, name: username });
      } else {
        window.mc.addPlayerToBlacklist(id, { uuid, name: username });
      }
    }
  };

  const handleAddPlayer = (username: string, uuid: string) => {
    const existing = players.find(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    );

    if (!existing) {
      // Add new player
      setPlayers((prev) => [
        ...prev,
        {
          uuid,
          username,
          lastSeen: new Date(),
        },
      ]);
    }

    setShowAddModal(false);
  };

  const handleRemovePlayer = (uuid: string, username: string) => {
    window.mc.removePlayerFromWhitelist(id!, { uuid, name: username });
    window.mc.removePlayerFromBlacklist(id!, { uuid, name: username });
    setPlayers((prev) => prev.filter((p) => p.username !== username));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-base-content/70">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Players</h2>
          <p className="text-sm text-base-content/70 mt-1">
            Manage server players, whitelist, and bans
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary gap-2"
        >
          <FaPlus /> Add Player
        </button>
      </div>

      {/* Restriction Mode Toggle */}
      <div className="p-4 bg-base-200 rounded-lg">
        <label className="label">
          <span className="label-text font-medium">Player Access Control</span>
        </label>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="restriction"
              value="whitelist"
              checked={restrictionMode === 'whitelist'}
              onChange={() => setRestrictionMode('whitelist')}
              className="radio radio-sm"
            />
            <span className="text-sm">Whitelist</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="restriction"
              value="blacklist"
              checked={restrictionMode === 'blacklist'}
              onChange={() => setRestrictionMode('blacklist')}
              className="radio radio-sm"
            />
            <span className="text-sm">Blacklist</span>
          </label>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="select select-bordered w-full"
        >
          <option value="all">All Players ({players.length})</option>
          <option value="online">Online ({onlinePlayers.size})</option>
          {restrictionMode === 'whitelist' && (
            <option value="whitelisted">
              Whitelisted ({whitelistedPlayers.size})
            </option>
          )}
          {restrictionMode === 'blacklist' && (
            <option value="banned">Banned ({bannedPlayers.size})</option>
          )}
        </select>
      </div>

      {/* Players Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers
            .sort(
              (a, b) =>
                (b.lastSeen?.getTime() ?? 0) - (a.lastSeen?.getTime() ?? 0),
            )
            .map((player) => (
              <PlayerCard
                key={player.username}
                player={player}
                isOnline={onlinePlayers.has(player.username)}
                isWhitelisted={whitelistedPlayers.has(player.username)}
                isBanned={bannedPlayers.has(player.username)}
                onToggleWhitelist={() =>
                  handleToggleWhitelist(player.uuid, player.username)
                }
                onToggleBan={() =>
                  handleToggleBan(player.uuid, player.username)
                }
                onRemove={() =>
                  handleRemovePlayer(player.uuid, player.username)
                }
                isServerRunning={isServerRunning}
                restrictionMode={restrictionMode}
              />
            ))}
        </div>
      ) : (
        <div className="bg-base-200 rounded-lg p-8 text-center">
          <p className="text-base-content/70">
            {searchTerm
              ? 'No players match your search'
              : 'No players found. Add one to get started!'}
          </p>
        </div>
      )}

      {/* Add Player Modal */}
      <AddPlayerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPlayer}
        existingPlayers={players}
      />
    </div>
  );
}

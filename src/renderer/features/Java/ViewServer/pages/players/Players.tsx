import { MinecraftServerAPI } from '@renderer/preload';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaBan } from 'react-icons/fa';
import { PlayerCard, AddPlayerModal } from './components';
import type { Player } from './types';

declare global {
  interface Window {
    mc: MinecraftServerAPI;
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
    'none' | 'whitelist' | 'blacklist'
  >('none');

  const storageKey = id ? `players-${id}` : null;

  // Load players from localStorage
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
        setOnlinePlayers(new Set(data.onlinePlayers || []));
        setWhitelistedPlayers(new Set(data.whitelistedPlayers || []));
        setBannedPlayers(new Set(data.bannedPlayers || []));
        setRestrictionMode(data.restrictionMode || 'none');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading players:', error);
      setLoading(false);
    }
  }, [storageKey]);

  // Save players to localStorage
  useEffect(() => {
    if (!storageKey || players.length === 0) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          players,
          onlinePlayers: Array.from(onlinePlayers),
          whitelistedPlayers: Array.from(whitelistedPlayers),
          bannedPlayers: Array.from(bannedPlayers),
          restrictionMode,
        }),
      );
    } catch (error) {
      console.error('Error saving players:', error);
    }
  }, [
    players,
    onlinePlayers,
    whitelistedPlayers,
    bannedPlayers,
    restrictionMode,
    storageKey,
  ]);

  // Listen for console logs to track online players
  useEffect(() => {
    if (!id) return;

    let active = true;

    const handleLog = (data: {
      id: string;
      line: string;
      stream: 'stdout' | 'stderr';
    }) => {
      if (!active || data.id !== id || data.stream === 'stderr') return;

      // Parse "Player joined" messages
      const joinedMatch = data.line.match(
        /\[.*?\]: (.+?)\[\/(.+?)\] logged in with entity id (\d+) at \((.*?)\)/,
      );
      if (joinedMatch) {
        const username = joinedMatch[1];
        setOnlinePlayers((prev) => new Set(prev).add(username));

        // Add or update player
        setPlayers((prev) => {
          const existing = prev.find((p) => p.username === username);
          if (existing) {
            return prev.map((p) =>
              p.username === username ? { ...p, lastSeen: new Date() } : p,
            );
          }
          return [
            ...prev,
            {
              uuid: '', // Will be empty until we get it from the list command
              username,
              lastSeen: new Date(),
              isOnline: true,
            },
          ];
        });
      }

      // Parse "Player left" messages
      const leftMatch = data.line.match(/\[.*?\]: (.+?) left the game/);
      if (leftMatch) {
        const username = leftMatch[1];
        setOnlinePlayers((prev) => {
          const next = new Set(prev);
          next.delete(username);
          return next;
        });

        setPlayers((prev) =>
          prev.map((p) =>
            p.username === username
              ? { ...p, lastSeen: new Date(), isOnline: false }
              : p,
          ),
        );
      }
    };

    window.mc.onLog(handleLog);

    return () => {
      active = false;
    };
  }, [id]);

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

  const handleToggleWhitelist = (username: string) => {
    setWhitelistedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });

    // If server is running, execute command
    if (isServerRunning && id) {
      const isAdding = !whitelistedPlayers.has(username);
      const command = isAdding
        ? `whitelist add ${username}`
        : `whitelist remove ${username}`;
      window.mc.cmd(id, command);
    }
  };

  const handleToggleBan = (username: string) => {
    setBannedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(username)) {
        next.delete(username);
      } else {
        next.add(username);
      }
      return next;
    });

    // If server is running, execute command
    if (isServerRunning && id) {
      const isAdding = !bannedPlayers.has(username);
      const command = isAdding ? `ban ${username}` : `pardon ${username}`;
      window.mc.cmd(id, command);
    }
  };

  const handleAddPlayer = (username: string, uuid: string) => {
    const existing = players.find(
      (p) => p.username.toLowerCase() === username.toLowerCase(),
    );

    if (existing) {
      // Update existing player's UUID if needed
      if (!existing.uuid) {
        setPlayers((prev) =>
          prev.map((p) => (p.username === username ? { ...p, uuid } : p)),
        );
      }
    } else {
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

  const handleRemovePlayer = (username: string) => {
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
              value="none"
              checked={restrictionMode === 'none'}
              onChange={() => setRestrictionMode('none')}
              className="radio radio-sm"
            />
            <span className="text-sm">None</span>
          </label>
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
                onToggleWhitelist={() => handleToggleWhitelist(player.username)}
                onToggleBan={() => handleToggleBan(player.username)}
                onRemove={() => handleRemovePlayer(player.username)}
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

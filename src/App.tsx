import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  GameState,
  Player,
  RoomConfig,
  ChatMessage,
  GamePhase,
  RoleId,
} from './types/game';
import { ROLES, distributeRoles } from './engine/roles';
import { GameEngine } from './engine/gameEngine';
import { BotAI } from './engine/botAI';
import { PeerManager } from './network/peerManager';
import { sfx } from './audio/soundEffects';

import { NinjaHeader } from './components/ui/NinjaHeader';
import { LobbyView } from './components/lobby/LobbyView';
import { RoleCard } from './components/game/RoleCard';
import { VillageBoard } from './components/game/VillageBoard';
import { ShinobiChat } from './components/chat/ShinobiChat';
import { NightPhaseOverlay } from './components/night/NightPhaseOverlay';
import { DayAnnouncementModal } from './components/game/DayAnnouncementModal';
import { GameOverModal } from './components/game/GameOverModal';
import { DancroxEasterEgg } from './components/easteregg/DancroxEasterEgg';

const INITIAL_CONFIG: RoomConfig = {
  roomCode: '',
  hostId: '',
  nightDurationSeconds: 30,
  dayDiscussionDurationSeconds: 45,
  dayVotingDurationSeconds: 25,
  revealRoleOnDeath: true,
  allowKamikazeRole: true,
  enabledRoles: Object.keys(ROLES) as RoleId[],
  minPlayers: 4,
  maxPlayers: 15,
};

export const App: React.FC = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showDancroxModal, setShowDancroxModal] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [config, setConfig] = useState<RoomConfig>(INITIAL_CONFIG);

  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    phase: 'LOBBY',
    dayNumber: 1,
    timeRemaining: 0,
    players: [],
    messages: [],
    winnerFaction: null,
    lastNightReport: null,
    executedPlayer: null,
    spiritTarget: null,
    systemAnnouncements: [],
  });

  const peerManagerRef = useRef<PeerManager | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sfx.setMuted(next);
  };

  const addSystemMessage = useCallback((content: string) => {
    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: 'system',
      senderName: 'Mestre Ancião Shinobi',
      content,
      timestamp: Date.now(),
      channel: 'SYSTEM',
    };
    setGameState((prev) => ({
      ...prev,
      messages: [...prev.messages, sysMsg],
    }));
  }, []);

  const handleCreateRoom = async (playerName: string) => {
    const roomCode = `NKN-${Math.floor(1000 + Math.random() * 9000)}`;
    const hostPlayer: Player = {
      id: `player-host-${Date.now()}`,
      name: playerName,
      isHost: true,
      isBot: false,
      isAlive: true,
      avatarSeed: 1,
      votesReceived: 0,
      votedFor: null,
      nightActionTarget: null,
      isSilenced: false,
      isProtected: false,
      isShieldReflecting: false,
    };

    const newConfig: RoomConfig = {
      ...INITIAL_CONFIG,
      roomCode,
      hostId: hostPlayer.id,
    };

    setCurrentPlayer(hostPlayer);
    setConfig(newConfig);
    setIsInRoom(true);

    const initialGameState: GameState = {
      roomCode,
      phase: 'LOBBY',
      dayNumber: 1,
      timeRemaining: 0,
      players: [hostPlayer],
      messages: [],
      winnerFaction: null,
      lastNightReport: null,
      executedPlayer: null,
      spiritTarget: null,
      systemAnnouncements: [`A sala ${roomCode} foi estabelecida pelo líder ${playerName}.`],
    };

    setGameState(initialGameState);

    const manager = new PeerManager({
      onStateUpdate: (state) => setGameState(state),
      onChatMessage: (msg) =>
        setGameState((prev) => ({ ...prev, messages: [...prev.messages, msg] })),
      onPeerError: (err) => console.warn('Peer host warning:', err),
      onPlayerJoinRequest: (newPlayer, conn) => {
        setGameState((prev) => {
          if (prev.players.some((p) => p.name.toLowerCase() === newPlayer.name.toLowerCase())) {
            newPlayer.name = `${newPlayer.name}_${Math.floor(Math.random() * 100)}`;
          }
          const updatedPlayers = [...prev.players, newPlayer];
          const updatedState = {
            ...prev,
            players: updatedPlayers,
          };
          conn.send({
            type: 'JOIN_ACCEPTED',
            playerId: newPlayer.id,
            gameState: updatedState,
            config: newConfig,
          });
          manager.broadcastState(updatedState);
          return updatedState;
        });
      },
    });

    try {
      await manager.createRoom(roomCode, hostPlayer);
      peerManagerRef.current = manager;
    } catch {
      // Local fallback
    }

    sfx.playParchment();
  };

  const handleJoinRoom = async (roomCode: string, playerName: string) => {
    const clientPlayer: Player = {
      id: `player-client-${Date.now()}`,
      name: playerName,
      isHost: false,
      isBot: false,
      isAlive: true,
      avatarSeed: 2,
      votesReceived: 0,
      votedFor: null,
      nightActionTarget: null,
      isSilenced: false,
      isProtected: false,
      isShieldReflecting: false,
    };

    setCurrentPlayer(clientPlayer);
    setIsInRoom(true);

    const manager = new PeerManager({
      onStateUpdate: (state) => setGameState(state),
      onChatMessage: (msg) =>
        setGameState((prev) => ({ ...prev, messages: [...prev.messages, msg] })),
      onPeerError: (err) => {
        alert(err);
      },
    });

    try {
      await manager.joinRoom(roomCode, clientPlayer, config);
      peerManagerRef.current = manager;
    } catch {
      // fallback
    }
  };

  const handleAddBots = (count: number) => {
    if (!currentPlayer?.isHost) return;

    setGameState((prev) => {
      const newBots: Player[] = [];
      for (let i = 0; i < count; i++) {
        if (prev.players.length + newBots.length >= config.maxPlayers) break;
        const botName = BotAI.generateBotName([...prev.players, ...newBots]);
        newBots.push({
          id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: botName,
          isHost: false,
          isBot: true,
          isAlive: true,
          avatarSeed: Math.floor(Math.random() * 100),
          votesReceived: 0,
          votedFor: null,
          nightActionTarget: null,
          isSilenced: false,
          isProtected: false,
          isShieldReflecting: false,
        });
      }

      const updatedPlayers = [...prev.players, ...newBots];
      const updatedState = { ...prev, players: updatedPlayers };
      peerManagerRef.current?.broadcastState(updatedState);
      return updatedState;
    });

    sfx.playParchment();
  };

  const handleStartGame = () => {
    if (!currentPlayer?.isHost) return;
    if (gameState.players.length < config.minPlayers) return;

    const roles = distributeRoles(gameState.players.length, config.enabledRoles);
    const assignedPlayers = gameState.players.map((p, idx) => ({
      ...p,
      role: roles[idx],
      originalRole: roles[idx],
      isAlive: true,
      votesReceived: 0,
      votedFor: null,
      nightActionTarget: null,
      isSilenced: false,
      isProtected: false,
      isShieldReflecting: false,
      usesRemaining: ROLES[roles[idx]]?.maxUses ?? undefined,
    }));

    const myUpdated = assignedPlayers.find((p) => p.id === currentPlayer.id);
    if (myUpdated) {
      setCurrentPlayer(myUpdated);
    }

    const nextState: GameState = {
      ...gameState,
      phase: 'NIGHT',
      dayNumber: 1,
      timeRemaining: config.nightDurationSeconds,
      players: assignedPlayers,
      winnerFaction: null,
      lastNightReport: null,
      executedPlayer: null,
      spiritTarget: null,
    };

    setGameState(nextState);
    peerManagerRef.current?.broadcastState(nextState);

    sfx.playNightfall();
    addSystemMessage('A escuridão desce sobre a vila. Ninjas, executem suas missões secretas sob o manto da noite!');
  };

  const handleSendMessage = (content: string, channel: 'PUBLIC' | 'NUKENIN' | 'DEAD') => {
    if (!currentPlayer) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: currentPlayer.id,
      senderName: currentPlayer.name,
      senderRole: channel === 'NUKENIN' || channel === 'DEAD' ? currentPlayer.role : undefined,
      content,
      timestamp: Date.now(),
      channel,
    };

    setGameState((prev) => {
      const updated = { ...prev, messages: [...prev.messages, newMsg] };
      peerManagerRef.current?.broadcastChat(newMsg);
      return updated;
    });
  };

  const handleConfirmNightAction = (targetId: string | null) => {
    if (!currentPlayer) return;
    setSelectedTargetId(targetId);

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) =>
        p.id === currentPlayer.id ? { ...p, nightActionTarget: targetId } : p
      );
      const updatedState = { ...prev, players: updatedPlayers };
      peerManagerRef.current?.broadcastState(updatedState);
      return updatedState;
    });

    sfx.playKatanaSlash();
  };

  const handleSelectVoteTarget = (targetId: string) => {
    if (!currentPlayer || !currentPlayer.isAlive) return;
    setSelectedTargetId(targetId);

    setGameState((prev) => {
      const updatedPlayers = prev.players.map((p) =>
        p.id === currentPlayer.id ? { ...p, votedFor: targetId } : p
      );
      const updatedState = { ...prev, players: updatedPlayers };
      peerManagerRef.current?.broadcastState(updatedState);
      return updatedState;
    });

    sfx.playTaiko();
  };

  const advanceFromNightToDawn = useCallback(() => {
    setGameState((prev) => {
      const updatedWithBots = prev.players.map((p) => {
        if (p.isBot && p.isAlive && !p.nightActionTarget) {
          return { ...p, nightActionTarget: BotAI.chooseNightAction(p, prev) };
        }
        return p;
      });

      const intermediateState = { ...prev, players: updatedWithBots };

      const { updatedPlayers, report } = GameEngine.resolveNight(intermediateState);

      const winner = GameEngine.checkWinner(updatedPlayers);

      const nextPhase: GamePhase = winner ? 'GAME_OVER' : 'DAY_ANNOUNCEMENT';

      const nextState: GameState = {
        ...prev,
        phase: nextPhase,
        timeRemaining: 0,
        players: updatedPlayers,
        lastNightReport: report,
        winnerFaction: winner,
      };

      const myRef = updatedPlayers.find((p) => p.id === currentPlayer?.id);
      if (myRef) setCurrentPlayer(myRef);

      peerManagerRef.current?.broadcastState(nextState);
      sfx.playGong();
      return nextState;
    });
  }, [currentPlayer?.id]);

  const handleProceedToDiscussion = () => {
    setGameState((prev) => {
      const nextState: GameState = {
        ...prev,
        phase: 'DAY_DISCUSSION',
        timeRemaining: config.dayDiscussionDurationSeconds,
      };
      peerManagerRef.current?.broadcastState(nextState);
      return nextState;
    });
    setSelectedTargetId(null);
  };

  const advanceFromDiscussionToVoting = useCallback(() => {
    setGameState((prev) => {
      const nextState: GameState = {
        ...prev,
        phase: 'DAY_VOTING',
        timeRemaining: config.dayVotingDurationSeconds,
      };
      peerManagerRef.current?.broadcastState(nextState);
      sfx.playTaiko();
      return nextState;
    });
    setSelectedTargetId(null);
  }, [config.dayVotingDurationSeconds]);

  const advanceFromVotingToResolution = useCallback(() => {
    setGameState((prev) => {
      const updatedWithBotVotes = prev.players.map((p) => {
        if (p.isBot && p.isAlive && !p.votedFor) {
          return { ...p, votedFor: BotAI.chooseVote(p, prev) };
        }
        return p;
      });

      const { updatedPlayers, executedPlayer, tie } = GameEngine.resolveVoting(updatedWithBotVotes);

      const winner = GameEngine.checkWinner(updatedPlayers);

      let announcement = '';
      if (tie) {
        announcement = 'A votação empatou! Nenhum shinobi foi executado hoje.';
      } else if (executedPlayer) {
        const roleInfo = config.revealRoleOnDeath && executedPlayer.role ? ` (${ROLES[executedPlayer.role].name})` : '';
        announcement = `O conselho da vila condenou e executou ${executedPlayer.name}${roleInfo}!`;
        sfx.playKatanaSlash();
      } else {
        announcement = 'Nenhum voto foi computado. O dia encerra em silêncio.';
      }

      const nextPhase: GamePhase = winner ? 'GAME_OVER' : 'NIGHT';

      const nextState: GameState = {
        ...prev,
        phase: nextPhase,
        dayNumber: prev.dayNumber + 1,
        timeRemaining: nextPhase === 'NIGHT' ? config.nightDurationSeconds : 0,
        players: updatedPlayers.map((p) => ({ ...p, votedFor: null })),
        messages: [
          ...prev.messages,
          {
            id: `exec-${Date.now()}`,
            senderId: 'system',
            senderName: 'Mestre Ancião Shinobi',
            content: announcement,
            timestamp: Date.now(),
            channel: 'SYSTEM',
          },
        ],
        executedPlayer,
        winnerFaction: winner,
      };

      const myRef = updatedPlayers.find((p) => p.id === currentPlayer?.id);
      if (myRef) setCurrentPlayer(myRef);

      peerManagerRef.current?.broadcastState(nextState);

      if (nextPhase === 'NIGHT') {
        sfx.playNightfall();
      }

      return nextState;
    });
  }, [config.nightDurationSeconds, config.revealRoleOnDeath, currentPlayer?.id]);

  useEffect(() => {
    if (!currentPlayer?.isHost || gameState.phase === 'LOBBY' || gameState.phase === 'GAME_OVER') {
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          if (prev.phase === 'NIGHT') {
            advanceFromNightToDawn();
          } else if (prev.phase === 'DAY_DISCUSSION') {
            advanceFromDiscussionToVoting();
          } else if (prev.phase === 'DAY_VOTING') {
            advanceFromVotingToResolution();
          }
          return { ...prev, timeRemaining: 0 };
        }

        if (prev.phase === 'DAY_DISCUSSION' && Math.random() < 0.18) {
          const livingBots = prev.players.filter((p) => p.isBot && p.isAlive);
          if (livingBots.length > 0) {
            const randomBot = livingBots[Math.floor(Math.random() * livingBots.length)];
            const botMsg = BotAI.generateChatMessage(randomBot, prev);
            if (botMsg) {
              peerManagerRef.current?.broadcastChat(botMsg);
              return {
                ...prev,
                timeRemaining: prev.timeRemaining - 1,
                messages: [...prev.messages, botMsg],
              };
            }
          }
        }

        const nextTime = prev.timeRemaining - 1;
        const updated = { ...prev, timeRemaining: nextTime };
        peerManagerRef.current?.broadcastState(updated);
        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    currentPlayer?.isHost,
    gameState.phase,
    advanceFromNightToDawn,
    advanceFromDiscussionToVoting,
    advanceFromVotingToResolution,
  ]);

  const handleReturnToLobby = () => {
    const resetPlayers = gameState.players.map((p) => ({
      ...p,
      isAlive: true,
      role: undefined,
      votesReceived: 0,
      votedFor: null,
      nightActionTarget: null,
      isSilenced: false,
      isProtected: false,
      isShieldReflecting: false,
    }));

    const nextState: GameState = {
      ...gameState,
      phase: 'LOBBY',
      dayNumber: 1,
      timeRemaining: 0,
      players: resetPlayers,
      winnerFaction: null,
      lastNightReport: null,
      executedPlayer: null,
      spiritTarget: null,
    };

    setGameState(nextState);
    peerManagerRef.current?.broadcastState(nextState);
    sfx.playParchment();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0d12] text-slate-100 font-sans selection:bg-red-900 selection:text-white">
      <NinjaHeader
        roomCode={config.roomCode}
        phase={gameState.phase}
        dayNumber={gameState.dayNumber}
        timeRemaining={gameState.timeRemaining}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onTriggerDancrox={() => setShowDancroxModal(true)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 flex flex-col items-center">
        {gameState.phase === 'LOBBY' ? (
          <LobbyView
            players={gameState.players}
            currentPlayer={currentPlayer}
            config={config}
            isInRoom={isInRoom}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onUpdateConfig={(upd) => setConfig((prev) => ({ ...prev, ...upd }))}
            onAddBots={handleAddBots}
            onStartGame={handleStartGame}
            onTriggerDancrox={() => setShowDancroxModal(true)}
          />
        ) : (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 space-y-4">
              {currentPlayer?.role && (
                <RoleCard
                  roleId={currentPlayer.role}
                  usesRemaining={currentPlayer.usesRemaining}
                  isSilenced={currentPlayer.isSilenced}
                />
              )}

              {gameState.phase === 'NIGHT' && currentPlayer?.isAlive && (
                <NightPhaseOverlay
                  currentPlayer={currentPlayer}
                  players={gameState.players}
                  selectedTargetId={selectedTargetId}
                  onConfirmNightAction={handleConfirmNightAction}
                />
              )}

              {currentPlayer && (
                <div className="hidden lg:block h-[380px]">
                  <ShinobiChat
                    messages={gameState.messages}
                    currentPlayer={currentPlayer}
                    phase={gameState.phase}
                    onSendMessage={handleSendMessage}
                    onTriggerDancrox={() => setShowDancroxModal(true)}
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-8 space-y-4">
              <VillageBoard
                players={gameState.players}
                currentPlayerId={currentPlayer?.id || ''}
                phase={gameState.phase}
                selectedTargetId={selectedTargetId}
                onSelectTarget={(targetId) => {
                  if (gameState.phase === 'NIGHT') {
                    handleConfirmNightAction(targetId);
                  } else if (gameState.phase === 'DAY_VOTING') {
                    handleSelectVoteTarget(targetId);
                  }
                }}
                revealRoleOnDeath={config.revealRoleOnDeath}
              />

              {currentPlayer && (
                <div className="block lg:hidden h-[340px]">
                  <ShinobiChat
                    messages={gameState.messages}
                    currentPlayer={currentPlayer}
                    phase={gameState.phase}
                    onSendMessage={handleSendMessage}
                    onTriggerDancrox={() => setShowDancroxModal(true)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {gameState.phase === 'DAY_ANNOUNCEMENT' && currentPlayer && (
        <DayAnnouncementModal
          report={gameState.lastNightReport}
          currentPlayer={currentPlayer}
          onProceedToDiscussion={handleProceedToDiscussion}
        />
      )}

      {gameState.phase === 'GAME_OVER' && currentPlayer && (
        <GameOverModal
          winnerFaction={gameState.winnerFaction}
          players={gameState.players}
          currentPlayer={currentPlayer}
          onReturnToLobby={handleReturnToLobby}
        />
      )}

      <DancroxEasterEgg
        isOpen={showDancroxModal}
        onClose={() => setShowDancroxModal(false)}
      />
    </div>
  );
};

export default App;

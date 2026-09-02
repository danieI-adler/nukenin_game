import React from 'react';
import type { Player, GamePhase, RoleId } from '../../types/game';
import { ROLES } from '../../engine/roles';
import { Sparkles, Skull, Crown, Bot, Crosshair, Lock, CheckCircle2 } from 'lucide-react';
import { sfx } from '../../audio/soundEffects';

interface VillageBoardProps {
  players: Player[];
  currentPlayerId: string;
  phase: GamePhase;
  selectedTargetId: string | null;
  onSelectTarget: (targetId: string | null) => void;
  revealRoleOnDeath?: boolean;
}

export const VillageBoard: React.FC<VillageBoardProps> = ({
  players,
  currentPlayerId,
  phase,
  selectedTargetId,
  onSelectTarget,
  revealRoleOnDeath = true,
}) => {
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const isNight = phase === 'NIGHT';
  const isVoting = phase === 'DAY_VOTING';
  const canInteract = currentPlayer?.isAlive && !currentPlayer?.isSilenced && (isNight || isVoting);

  const getRoleBadge = (roleId?: RoleId) => {
    if (!roleId) return null;
    const role = ROLES[roleId];
    return (
      <span
        className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
        style={{
          backgroundColor: `${role.badgeColor}22`,
          borderColor: `${role.badgeColor}66`,
          color: role.badgeColor,
        }}
      >
        {role.name} ({role.kanji})
      </span>
    );
  };

  return (
    <div className="w-full bg-[#121722]/80 border border-[#222b3d] rounded-xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 border-b border-[#222b3d] pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-display font-bold text-sm tracking-wider text-slate-200 uppercase">
            Habitantes da Vila Shinobi ({players.filter((p) => p.isAlive).length}/{players.length} vivos)
          </h2>
        </div>
        {canInteract && (
          <div className="text-xs font-mono text-amber-400/90 flex items-center gap-1 animate-pulse">
            <Crosshair className="w-3.5 h-3.5 text-red-500" />
            <span>{isNight ? 'Clique para escolher/trocar seu alvo' : 'Clique para votar'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {players.map((player) => {
          const isMe = player.id === currentPlayerId;
          const isSelected = selectedTargetId === player.id;
          const isTargetable = canInteract && player.isAlive && (!isVoting || !isMe);

          return (
            <div
              key={player.id}
              onClick={() => {
                if (isTargetable) {
                  sfx.playParchment();
                  // Toggle: if already selected, deselect; otherwise select
                  if (isSelected) {
                    onSelectTarget(null);
                  } else {
                    onSelectTarget(player.id);
                  }
                }
              }}
              className={`relative rounded-lg p-3 flex flex-col items-center justify-between text-center transition-all duration-150 select-none border ${
                !player.isAlive
                  ? 'bg-[#080a0e]/70 border-slate-800 opacity-60'
                  : isSelected
                  ? 'bg-[#2b1010] border-red-500 ring-2 ring-red-500/70 shadow-lg scale-[1.03]'
                  : isTargetable
                  ? 'bg-[#161c28] border-[#2d3748] hover:border-amber-500/80 hover:bg-[#1a2232] cursor-pointer active:scale-95'
                  : 'bg-[#161c28] border-[#222b3d]'
              } ${isMe ? 'ring-1 ring-amber-500/40' : ''}`}
            >
              <div className="w-full flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {player.isHost && (
                    <span title="Líder da Sala">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  )}
                  {player.isBot && (
                    <span title="Bot Shinobi">
                      <Bot className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  )}
                  {player.isDancroxEasterEgg && (
                    <span title="Lenda NKN DANCROX">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                    </span>
                  )}
                </div>

                {isMe && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-600/60 text-amber-300 font-bold">
                    VOCÊ
                  </span>
                )}
              </div>

              <div className="relative my-1">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-kanji text-2xl font-bold border-2 shadow-inner transition-transform ${
                    !player.isAlive
                      ? 'bg-slate-900 border-slate-700 text-slate-600'
                      : isSelected
                      ? 'bg-red-950 border-red-500 text-red-300 scale-105'
                      : 'bg-[#1e2536] border-[#374151] text-slate-200'
                  }`}
                >
                  {!player.isAlive ? (
                    <Skull className="w-6 h-6 text-red-500/80" />
                  ) : isMe && player.role ? (
                    ROLES[player.role]?.kanji || '忍'
                  ) : (
                    '忍'
                  )}
                </div>

                {!player.isAlive && (
                  <div className="absolute -bottom-1 -right-1 bg-red-950 border border-red-700 rounded-full p-0.5">
                    <Skull className="w-3 h-3 text-red-400" />
                  </div>
                )}

                {player.isSilenced && isMe && (
                  <div className="absolute -top-1 -right-1 bg-red-900 border border-red-500 rounded-full p-1 animate-bounce" title="Chakra Selado!">
                    <Lock className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="mt-2 w-full">
                <div className="font-semibold text-xs text-slate-200 truncate" title={player.name}>
                  {player.name}
                </div>

                {/* Only reveal role if dead or if current player */}
                {(!player.isAlive && revealRoleOnDeath && player.role) || (isMe && player.role) ? (
                  <div className="mt-1 flex justify-center">{getRoleBadge(player.role)}</div>
                ) : null}

                {!player.isAlive && player.deathCause && (
                  <div className="text-[9px] text-red-400/80 italic mt-1 truncate" title={player.deathCause}>
                    {player.deathCause}
                  </div>
                )}
              </div>

              {isVoting && player.votesReceived > 0 && (
                <div className="mt-2 px-2 py-0.5 rounded bg-red-950/90 border border-red-600 text-red-300 font-mono text-xs font-bold animate-pulse">
                  {player.votesReceived} {player.votesReceived === 1 ? 'voto' : 'votos'}
                </div>
              )}

              {isSelected && (
                <div className="mt-1.5 px-2 py-0.5 rounded bg-red-950 border border-red-500 text-[10px] font-mono text-red-300 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-red-400" />
                  <span>{isNight ? 'ALVO DEFINIDO' : 'VOTO REGISTRADO'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

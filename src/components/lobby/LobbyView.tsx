import React, { useState } from 'react';
import type { Player, RoomConfig, RoleId } from '../../types/game';
import { ROLES } from '../../engine/roles';
import {
  Users,
  Settings,
  Play,
  Copy,
  Check,
  Bot,
  Crown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { sfx } from '../../audio/soundEffects';

interface LobbyViewProps {
  players: Player[];
  currentPlayer: Player | null;
  config: RoomConfig;
  isInRoom: boolean;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onCreateRoom: (playerName: string) => void;
  onUpdateConfig: (config: Partial<RoomConfig>) => void;
  onAddBots: (count: number) => void;
  onStartGame: () => void;
  onTriggerDancrox: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  players,
  currentPlayer,
  config,
  isInRoom,
  onJoinRoom,
  onCreateRoom,
  onUpdateConfig,
  onAddBots,
  onStartGame,
  onTriggerDancrox,
}) => {
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'JOIN' | 'CREATE'>('CREATE');

  const isHost = currentPlayer?.isHost ?? false;
  const canStart = players.length >= config.minPlayers;

  const handleCopyCode = () => {
    if (!config.roomCode) return;
    navigator.clipboard.writeText(config.roomCode);
    setIsCopied(true);
    sfx.playParchment();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleRole = (roleId: RoleId) => {
    if (!isHost) return;
    const currentRoles = [...config.enabledRoles];
    const idx = currentRoles.indexOf(roleId);
    if (idx >= 0) {
      if (currentRoles.length <= 4) {
        alert('É necessário ter ao menos 4 cargos ativos para a partida!');
        return;
      }
      currentRoles.splice(idx, 1);
    } else {
      currentRoles.push(roleId);
    }
    onUpdateConfig({ enabledRoles: currentRoles });
    sfx.playParchment();
  };

  if (!isInRoom) {
    return (
      <div className="max-w-md w-full mx-auto px-4 py-8">
        <div className="bg-[#121722]/90 border border-[#222b3d] rounded-2xl p-6 shadow-2xl backdrop-blur-md text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#182030] border-2 border-red-600 flex items-center justify-center font-kanji text-3xl text-red-500 shadow-inner mb-3">
              忍
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-wider">
              NUKENIN SHINOBI
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Dedução social tática online na vila oculta. Descubra os infiltrados antes do massacre.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#0b0d12] p-1 rounded-xl border border-[#222b3d] mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('CREATE');
                sfx.playParchment();
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'CREATE'
                  ? 'bg-red-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar Nova Sala
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('JOIN');
                sfx.playParchment();
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'JOIN'
                  ? 'bg-red-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar por Código
            </button>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seu Apelido Shinobi:
              </label>
              <input
                type="text"
                placeholder="Ex: Kakashi_NKN"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                maxLength={18}
                className="w-full bg-[#161c28] border border-[#2a3449] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {activeTab === 'JOIN' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código da Sala (4-6 letras/números):
                </label>
                <input
                  type="text"
                  placeholder="Ex: NKN-8832"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="w-full bg-[#161c28] border border-[#2a3449] rounded-lg px-3 py-2 text-sm font-mono uppercase text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (!playerNameInput.trim()) {
                  alert('Por favor, informe seu apelido para entrar na vila.');
                  return;
                }
                if (activeTab === 'CREATE') {
                  onCreateRoom(playerNameInput.trim());
                } else {
                  if (!roomCodeInput.trim()) {
                    alert('Por favor, digite o código da sala.');
                    return;
                  }
                  onJoinRoom(roomCodeInput.trim(), playerNameInput.trim());
                }
              }}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-red-800 via-red-700 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-display font-bold text-sm tracking-wider shadow-lg transition-transform active:scale-98 border border-red-600/40 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{activeTab === 'CREATE' ? 'Fundar Sala da Vila' : 'Entrar no Esconderijo'}</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-[#222b3d] flex items-center justify-between text-[11px] text-slate-400">
            <a
              href="https://nukenin-blog-10bb33af.base44.app/Home"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <span>Comunidade NKN</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => {
                sfx.playDancroxLegendary();
                onTriggerDancrox();
              }}
              className="text-amber-500 hover:text-amber-300 font-display flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>NKN DANCROX</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-6 space-y-6">
      <div className="bg-[#121722]/90 border border-[#222b3d] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#182030] border border-red-700 flex items-center justify-center font-kanji text-2xl text-red-400">
            集
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Código de Entrada da Sala
            </div>
            <div className="font-mono text-2xl font-black text-amber-400 tracking-wider">
              {config.roomCode}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3.5 py-2 rounded-lg bg-[#1a2232] border border-[#2d3748] hover:border-amber-500/60 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Código Copiado!' : 'Copiar Código'}</span>
          </button>

          {isHost && (
            <button
              type="button"
              onClick={() => {
                sfx.playParchment();
                onAddBots(1);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#1e2536] border border-[#3b475e] hover:border-slate-400 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>+1 Bot Ninja</span>
            </button>
          )}

          {isHost && players.length < 6 && (
            <button
              type="button"
              onClick={() => {
                sfx.playParchment();
                onAddBots(4);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#1e2536] border border-[#3b475e] hover:border-slate-400 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>+4 Bots</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#121722]/80 border border-[#222b3d] rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-[#222b3d] pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h2 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wide">
                Shinobi Convocados ({players.length}/{config.maxPlayers})
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Mínimo para iniciar: {config.minPlayers}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto p-1">
            {players.map((p) => (
              <div
                key={p.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  p.id === currentPlayer?.id
                    ? 'bg-[#1b2333] border-amber-600/60'
                    : 'bg-[#161c28] border-[#222b3d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#20293a] border border-[#374151] flex items-center justify-center font-kanji font-bold text-slate-300 text-sm">
                    {p.isBot ? <Bot className="w-4 h-4 text-slate-400" /> : '忍'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                      <span>{p.name}</span>
                      {p.isHost && <Crown className="w-3 h-3 text-amber-400" />}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {p.isHost ? 'Líder da Sala' : p.isBot ? 'Bot Inteligente' : 'Jogador Conectado'}
                    </div>
                  </div>
                </div>

                {p.id === currentPlayer?.id && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono font-bold border border-amber-600/50">
                    VOCÊ
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-[#222b3d] flex items-center justify-between">
            {!isHost ? (
              <div className="text-xs text-slate-400 italic">
                Aguardando o Líder da Sala ({players.find((p) => p.isHost)?.name || 'Anfitrião'}) iniciar a partida...
              </div>
            ) : (
              <>
                <div className="text-xs text-slate-400">
                  {!canStart && (
                    <span className="text-amber-400 font-medium">
                      Requer ao menos {config.minPlayers} jogadores (adicione bots para testar já!).
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onStartGame}
                  disabled={!canStart}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-display font-bold text-xs tracking-wider shadow-lg transition-transform active:scale-98 border border-red-600/40 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Iniciar Conflito Shinobi</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#121722]/80 border border-[#222b3d] rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-[#222b3d] pb-2.5 mb-3">
            <Settings className="w-4 h-4 text-amber-400" />
            <h2 className="font-display font-bold text-sm text-slate-200 uppercase tracking-wide">
              Cargos Ativos ({config.enabledRoles.length}/14)
            </h2>
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {(Object.keys(ROLES) as RoleId[]).map((roleId) => {
              const role = ROLES[roleId];
              const isEnabled = config.enabledRoles.includes(roleId);

              return (
                <div
                  key={roleId}
                  onClick={() => toggleRole(roleId)}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                    !isHost ? 'opacity-90' : 'cursor-pointer hover:border-slate-500'
                  } ${
                    isEnabled
                      ? 'bg-[#161c28] border-[#2d3748]'
                      : 'bg-[#0b0e14] border-[#181e2b] opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center font-kanji font-bold text-xs border"
                      style={{
                        backgroundColor: `${role.badgeColor}22`,
                        borderColor: `${role.badgeColor}66`,
                        color: role.badgeColor,
                      }}
                    >
                      {role.kanji}
                    </span>
                    <span className="font-semibold text-slate-200">{role.name}</span>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1 rounded ${
                      role.faction === 'NUKENIN'
                        ? 'text-red-400'
                        : role.faction === 'NEUTRO'
                        ? 'text-amber-400'
                        : 'text-teal-400'
                    }`}
                  >
                    {role.faction}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

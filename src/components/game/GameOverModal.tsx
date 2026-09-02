import React, { useEffect } from 'react';
import type { Player, Faction } from '../../types/game';
import { ROLES } from '../../engine/roles';
import { RotateCcw, Skull, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../../audio/soundEffects';

interface GameOverModalProps {
  winnerFaction: Faction | null;
  players: Player[];
  currentPlayer: Player;
  onReturnToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winnerFaction,
  players,
  currentPlayer,
  onReturnToLobby,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ca8a04', '#dc2626', '#ffffff', '#f59e0b'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const getWinnerInfo = () => {
    switch (winnerFaction) {
      case 'ALDEIA':
        return {
          title: 'VITÓRIA DA ALDEIA OCULTA!',
          kanji: '勝',
          subtitle: 'Os infiltrados Nukenin e renegados foram expurgados com honra.',
          color: 'text-teal-400',
          borderColor: 'border-teal-600',
          bgGradient: 'from-[#0b2424] via-[#091515] to-[#040a0a]',
        };
      case 'NUKENIN':
        return {
          title: 'VITÓRIA DO CLÃ NUKENIN!',
          kanji: '滅',
          subtitle: 'A aldeia sucumbiu à supremacia e conspiração dos ninjas renegados.',
          color: 'text-red-500',
          borderColor: 'border-red-600',
          bgGradient: 'from-[#2b0a0a] via-[#170505] to-[#0a0202]',
        };
      case 'NEUTRO':
        return {
          title: 'SUPREMACIA DO RENEGADO SOLITÁRIO!',
          kanji: '狂',
          subtitle: 'O Renegado eliminou todos os rivais e reina solitário nas cinzas.',
          color: 'text-amber-400',
          borderColor: 'border-amber-600',
          bgGradient: 'from-[#291804] via-[#1a0f02] to-[#0a0501]',
        };
      default:
        return {
          title: 'EMPATE / DESTRUIÇÃO MÚTUA',
          kanji: '無',
          subtitle: 'Nenhuma alma restou viva para contar a lenda.',
          color: 'text-slate-400',
          borderColor: 'border-slate-600',
          bgGradient: 'from-[#151922] via-[#0e1118] to-[#080a0e]',
        };
    }
  };

  const winInfo = getWinnerInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className={`max-w-xl w-full bg-gradient-to-b ${winInfo.bgGradient} border-2 ${winInfo.borderColor} rounded-2xl shadow-2xl p-6 relative text-center`}
      >
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 mx-auto flex items-center justify-center font-kanji text-4xl mb-3 shadow-inner">
            <span className={winInfo.color}>{winInfo.kanji}</span>
          </div>
          <h2 className={`font-display text-2xl font-black tracking-wider uppercase ${winInfo.color}`}>
            {winInfo.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
            {winInfo.subtitle}
          </p>
        </div>

        <div className="bg-black/50 border border-white/10 rounded-xl p-3 mb-6 max-h-[260px] overflow-y-auto text-left">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-2 pb-1 border-b border-white/10">
            Identidade Revelada de Todos os Shinobi:
          </div>

          <div className="space-y-1.5">
            {players.map((p) => {
              const role = p.role ? ROLES[p.role] : ROLES.CIVIL;

              return (
                <div
                  key={p.id}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                    p.id === currentPlayer.id ? 'ring-1 ring-amber-500' : ''
                  } ${
                    p.isAlive
                      ? 'bg-[#161f2e]/80 border-slate-700'
                      : 'bg-black/40 border-slate-900 opacity-65'
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
                    <span className="font-semibold text-slate-200">{p.name}</span>
                    {p.id === currentPlayer.id && (
                      <span className="text-[9px] px-1 bg-amber-950 text-amber-300 rounded font-mono">
                        VOCÊ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                      style={{
                        color: role.badgeColor,
                        backgroundColor: `${role.badgeColor}15`,
                      }}
                    >
                      {role.name}
                    </span>

                    {p.isAlive ? (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Vivo
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-400 font-mono flex items-center gap-0.5">
                        <Skull className="w-3 h-3" /> Morto
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            sfx.playParchment();
            onReturnToLobby();
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-800 via-red-700 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-display font-bold text-sm tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 border border-red-600/40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Voltar ao Saguão da Vila</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import type { GamePhase } from '../../types/game';
import { Volume2, VolumeX, Moon, Sun, Flame, Sparkles } from 'lucide-react';
import { sfx } from '../../audio/soundEffects';

interface NinjaHeaderProps {
  roomCode: string;
  phase: GamePhase;
  dayNumber: number;
  timeRemaining: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerDancrox: () => void;
}

export const NinjaHeader: React.FC<NinjaHeaderProps> = ({
  roomCode,
  phase,
  dayNumber,
  timeRemaining,
  isMuted,
  onToggleMute,
  onTriggerDancrox,
}) => {
  const isNight = phase === 'NIGHT';
  const isDay = phase === 'DAY_DISCUSSION' || phase === 'DAY_VOTING' || phase === 'DAY_ANNOUNCEMENT' || phase === 'DAY_EXECUTION';

  const getPhaseTitle = () => {
    switch (phase) {
      case 'LOBBY':
        return { label: 'Saguão da Vila', kanji: '集', color: 'text-amber-400' };
      case 'ROLE_REVEAL':
        return { label: 'Atribuição de Cargos', kanji: '忍', color: 'text-purple-400' };
      case 'NIGHT':
        return { label: `Noite ${dayNumber} - Sombras`, kanji: '夜', color: 'text-red-500' };
      case 'DAY_ANNOUNCEMENT':
        return { label: `Alvorecer ${dayNumber}`, kanji: '朝', color: 'text-amber-500' };
      case 'DAY_DISCUSSION':
        return { label: `Dia ${dayNumber} - Debate`, kanji: '論', color: 'text-yellow-400' };
      case 'DAY_VOTING':
        return { label: `Dia ${dayNumber} - Julgamento`, kanji: '審', color: 'text-red-400' };
      case 'DAY_EXECUTION':
        return { label: 'Execução Pública', kanji: '斬', color: 'text-red-600' };
      case 'GAME_OVER':
        return { label: 'Fim do Conflito', kanji: '終', color: 'text-amber-300' };
      default:
        return { label: 'Nukenin', kanji: '忍', color: 'text-slate-300' };
    }
  };

  const currentPhaseInfo = getPhaseTitle();

  return (
    <header className="w-full bg-[#0b0d12]/95 border-b border-[#222b3d] backdrop-blur-md px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 transition-colors duration-500">
      <div className="flex items-center gap-3">
        <div 
          onClick={() => {
            sfx.playParchment();
          }}
          className="relative flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded bg-[#161c28] border border-[#dc2626]/40 flex items-center justify-center text-[#dc2626] font-bold shadow-inner group-hover:border-[#dc2626] transition-colors">
            <span className="font-kanji text-xl">忍</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold tracking-wider text-base text-slate-100 group-hover:text-[#dc2626] transition-colors">
                NUKENIN
              </span>
              <span className="text-[10px] tracking-widest px-1.5 py-0.5 rounded bg-[#991b1b]/30 text-red-300 border border-[#991b1b]/50 font-mono">
                SHINOBI
              </span>
            </div>
            <a
              href="https://nukenin-blog-10bb33af.base44.app/Home"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>Vila NKN</span>
              <span className="text-amber-500/70">●</span>
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sfx.playDancroxLegendary();
            onTriggerDancrox();
          }}
          title="Templo Oculto dos Ancestrais"
          className="ml-1 p-1.5 rounded text-amber-500/60 hover:text-amber-300 hover:bg-amber-950/40 transition-all text-xs flex items-center gap-1 border border-transparent hover:border-amber-500/40"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline text-[11px] font-display">Templo NKN</span>
        </button>
      </div>

      {phase !== 'LOBBY' && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#121722] border border-[#242d3d]">
            {isNight ? (
              <Moon className="w-4 h-4 text-indigo-400 animate-pulse" />
            ) : isDay ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Flame className="w-4 h-4 text-red-500" />
            )}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <span className="font-kanji text-sm text-amber-400/90">{currentPhaseInfo.kanji}</span>
                <span className={`text-xs font-semibold tracking-wide ${currentPhaseInfo.color}`}>
                  {currentPhaseInfo.label}
                </span>
              </div>
            </div>
          </div>

          {timeRemaining > 0 && (
            <div
              className={`px-3 py-1 rounded font-mono font-bold text-sm flex items-center justify-center min-w-[54px] border ${
                timeRemaining <= 5
                  ? 'bg-red-950/80 text-red-400 border-red-600 animate-ping'
                  : 'bg-[#121722] text-slate-200 border-[#242d3d]'
              }`}
            >
              {timeRemaining}s
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2.5">
        {roomCode && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-[#161c28] border border-[#2d3748] text-xs font-mono text-slate-300">
            <span className="text-slate-500">SALA:</span>
            <span className="text-amber-400 font-bold tracking-wider">{roomCode}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 rounded bg-[#121722] border border-[#222b3d] text-slate-300 hover:text-white hover:border-[#dc2626]/50 transition-colors"
          title={isMuted ? 'Ativar Efeitos Sonoros' : 'Mutar Efeitos Sonoros'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>
    </header>
  );
};

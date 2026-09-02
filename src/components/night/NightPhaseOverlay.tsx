import React from 'react';
import type { Player } from '../../types/game';
import { ROLES } from '../../engine/roles';
import { Moon, Lock, Crosshair } from 'lucide-react';
import { sfx } from '../../audio/soundEffects';

interface NightPhaseOverlayProps {
  currentPlayer: Player;
  players: Player[];
  selectedTargetId: string | null;
  onConfirmNightAction: (targetId: string | null) => void;
}

export const NightPhaseOverlay: React.FC<NightPhaseOverlayProps> = ({
  currentPlayer,
  players,
  selectedTargetId,
  onConfirmNightAction,
}) => {
  const role = currentPlayer.role ? ROLES[currentPlayer.role] : ROLES.CIVIL;
  const targetPlayer = players.find((p) => p.id === selectedTargetId);
  const isSilenced = currentPlayer.isSilenced;
  const hasAction = role.hasNightAction && (!role.maxUses || (currentPlayer.usesRemaining ?? 1) > 0);

  return (
    <div className="w-full bg-gradient-to-b from-[#10141f] via-[#0b0e14] to-[#07090d] border border-red-950/60 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-red-900/30 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-indigo-300 shadow-inner">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-100 tracking-wide flex items-center gap-1.5">
              <span>Operação Noturna das Sombras</span>
              <span className="font-kanji text-red-500">夜</span>
            </h3>
            <span className="text-[10px] font-mono text-indigo-300/80">
              A vila dorme enquanto os jutsus são executados nas sombras
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161c28] border border-[#2d3748]">
          <span className="font-kanji text-xs text-amber-400 font-bold">{role.kanji}</span>
          <span className="text-xs font-semibold text-slate-200">{role.name}</span>
        </div>
      </div>

      <div className="bg-[#141a24]/90 border border-[#252f42] rounded-lg p-3.5 mb-4">
        {isSilenced ? (
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
            <Lock className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>Seu chakra foi selado pelo Silenciador! Você não pode agir esta noite.</span>
          </div>
        ) : !hasAction ? (
          <div className="text-xs text-slate-400 leading-relaxed">
            Seu cargo não possui ação ativa esta noite. Fique em guarda e observe atentamente o desenrolar dos acontecimentos ao amanhecer.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-slate-200 font-medium">
              <span className="text-amber-400 font-bold">Objetivo Noturno: </span>
              {role.detailedSkill}
            </div>

            {targetPlayer ? (
              <div className="flex items-center justify-between bg-black/40 border border-red-900/50 rounded p-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Crosshair className="w-3.5 h-3.5 text-red-400 animate-spin" />
                  <span>Alvo Selecionado:</span>
                  <strong className="text-amber-300 font-semibold">{targetPlayer.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sfx.playKatanaSlash();
                    onConfirmNightAction(targetPlayer.id);
                  }}
                  className="px-3 py-1 rounded bg-red-700 hover:bg-red-600 text-white font-semibold text-xs transition-colors shadow"
                >
                  Confirmar Ação
                </button>
              </div>
            ) : (
              <div className="text-xs text-amber-400/90 italic flex items-center gap-1">
                <span>Clique em um shinobi na lista da vila abaixo para definir seu alvo.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

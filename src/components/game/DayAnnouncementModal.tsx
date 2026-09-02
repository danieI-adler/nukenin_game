import React from 'react';
import type { NightResolutionReport, Player } from '../../types/game';
import { ROLES } from '../../engine/roles';
import { Sun, Skull, ShieldCheck, Eye, ArrowRight } from 'lucide-react';
import { sfx } from '../../audio/soundEffects';

interface DayAnnouncementModalProps {
  report: NightResolutionReport | null;
  currentPlayer: Player;
  onProceedToDiscussion: () => void;
}

export const DayAnnouncementModal: React.FC<DayAnnouncementModalProps> = ({
  report,
  currentPlayer,
  onProceedToDiscussion,
}) => {
  if (!report) return null;

  const myInvestigation = report.investigationResults.find((r) => r.investigatorId === currentPlayer.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="max-w-lg w-full bg-[#f6eedf] text-[#1c1917] border-4 border-[#b91c1c] rounded-xl shadow-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-[#b91c1c]" />

        <div className="text-center mb-5 border-b-2 border-[#1c1917]/20 pb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sun className="w-5 h-5 text-amber-700" />
            <span className="font-kanji text-3xl font-bold text-[#b91c1c]">朝</span>
            <Sun className="w-5 h-5 text-amber-700" />
          </div>
          <h2 className="font-display text-xl font-extrabold tracking-wider text-[#1c1917] uppercase">
            Pergaminho do Alvorecer - Noite {report.nightNumber}
          </h2>
          <p className="text-xs font-serif italic text-stone-700">
            O sino do templo soou. Eis os acontecimentos registrados sob a névoa.
          </p>
        </div>

        <div className="space-y-3 mb-5">
          <div className="font-display font-bold text-xs uppercase text-[#b91c1c] flex items-center gap-1.5 border-b border-[#b91c1c]/30 pb-1">
            <Skull className="w-4 h-4 text-[#b91c1c]" />
            <span>Vítimas Encontradas na Vila:</span>
          </div>

          {report.eliminatedPlayers.length === 0 ? (
            <div className="p-3 bg-emerald-950/10 border border-emerald-800/30 rounded-lg text-xs text-emerald-900 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Nenhum shinobi foi eliminado esta noite! A vila permaneceu segura.</span>
            </div>
          ) : (
            report.eliminatedPlayers.map(({ player, cause }) => (
              <div
                key={player.id}
                className="p-3 bg-red-950/10 border border-red-800/30 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-red-950 flex items-center gap-1.5">
                    <span>{player.name}</span>
                    {player.role && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#b91c1c] text-white">
                        {ROLES[player.role]?.name} ({ROLES[player.role]?.kanji})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-700 mt-0.5 font-medium">{cause}</div>
                </div>
                <span className="font-kanji text-xl text-red-800">死</span>
              </div>
            ))
          )}
        </div>

        {myInvestigation && (
          <div className="p-3 bg-amber-950/10 border border-amber-800/40 rounded-lg mb-5">
            <div className="font-display font-bold text-xs uppercase text-amber-900 flex items-center gap-1.5 mb-1">
              <Eye className="w-4 h-4 text-amber-700" />
              <span>Relatório Secreto da Sua Investigação:</span>
            </div>
            <p className="text-xs text-stone-900 font-semibold leading-relaxed">
              {myInvestigation.resultText}
            </p>
          </div>
        )}

        <button
          onClick={() => {
            sfx.playGong();
            onProceedToDiscussion();
          }}
          className="w-full py-2.5 rounded-lg bg-[#b91c1c] hover:bg-[#991b1b] text-white font-display font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
        >
          <span>Abrir Assembleia da Vila</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

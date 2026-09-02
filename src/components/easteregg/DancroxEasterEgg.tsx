import React, { useEffect } from 'react';
import { Sparkles, Sword, X, Trophy, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../../audio/soundEffects';

interface DancroxEasterEggProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DancroxEasterEgg: React.FC<DancroxEasterEggProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      sfx.playDancroxLegendary();
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#facc15', '#f59e0b', '#dc2626', '#ffffff'],
        });
      } catch {
        // safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="max-w-md w-full bg-gradient-to-b from-[#241804] via-[#140e02] to-[#0a0701] border-2 border-amber-500 rounded-2xl shadow-[0_0_50px_rgba(250,204,21,0.35)] p-6 relative text-center overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 hover:text-white hover:bg-black/90 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Golden Crest */}
        <div className="relative my-2 inline-block">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-1 mx-auto shadow-2xl animate-pulse">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-kanji text-4xl text-amber-300">
              神
            </div>
          </div>
          <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-1 shadow">
            <Trophy className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="mt-3">
          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>O MAIOR DE TODOS OS TEMPOS</span>
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          </div>
          <h2 className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-wider mt-1">
            NKN DANCROX
          </h2>
        </div>

        {/* Lore & Tribute */}
        <div className="my-4 p-3.5 rounded-xl bg-black/60 border border-amber-500/30 text-xs text-amber-100/90 leading-relaxed font-serif text-left space-y-2">
          <p>
            Lenda imortal das sombras e pilar sagrado da comunidade <strong className="text-amber-300">NKN</strong>. Sua maestria transcende as eras shinobi.
          </p>
          <p className="text-[11px] text-amber-300/80 italic">
            "Nas trevas da noite ou na luz do alvorecer, a lâmina de Dancrox jamais erra o alvo."
          </p>
        </div>

        {/* Badges */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-600/40 text-center">
            <div className="text-[10px] text-amber-400 font-mono">TÍTULO HONORÁRIO</div>
            <div className="text-xs font-bold text-slate-100 flex items-center justify-center gap-1 mt-0.5">
              <Sword className="w-3 h-3 text-amber-400" />
              <span>Grão-Mestre Shinobi</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-600/40 text-center">
            <div className="text-[10px] text-amber-400 font-mono">STATUS DE CLÃ</div>
            <div className="text-xs font-bold text-slate-100 flex items-center justify-center gap-1 mt-0.5">
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              <span>G.O.A.T da NKN</span>
            </div>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black font-display font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-transform active:scale-98"
        >
          Prestar Reverência & Fechar
        </button>
      </div>
    </div>
  );
};

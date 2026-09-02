import React from 'react';
import type { RoleId } from '../../types/game';
import { ROLES } from '../../engine/roles';
import {
  User,
  Search,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  Sword,
  BadgeAlert,
  Ghost,
  Crown,
  Flame,
  Lock,
  Eye,
  Zap,
  Bomb,
  Skull,
} from 'lucide-react';

interface RoleCardProps {
  roleId: RoleId;
  usesRemaining?: number;
  isSilenced?: boolean;
  compact?: boolean;
}

const ICON_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  User,
  Search,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  Sword,
  BadgeAlert,
  Ghost,
  Crown,
  Flame,
  Lock,
  Eye,
  Zap,
  Bomb,
  Skull,
};

export const RoleCard: React.FC<RoleCardProps> = ({
  roleId,
  usesRemaining,
  isSilenced = false,
  compact = false,
}) => {
  const role = ROLES[roleId] || ROLES.CIVIL;
  const Icon = ICON_COMPONENTS[role.iconName] || User;

  const factionTheme =
    role.faction === 'NUKENIN'
      ? {
          name: 'Nukenin (Infiltrados)',
          bgGradient: 'from-[#2b0d0d] via-[#1a0808] to-[#120505]',
          border: 'border-red-900/60',
          sealColor: 'bg-red-950/80 text-red-500 border-red-700/80',
          textColor: 'text-red-400',
        }
      : role.faction === 'NEUTRO'
      ? {
          name: 'Renegado Solitário',
          bgGradient: 'from-[#291804] via-[#1a0f02] to-[#120a01]',
          border: 'border-amber-900/60',
          sealColor: 'bg-amber-950/80 text-amber-500 border-amber-700/80',
          textColor: 'text-amber-400',
        }
      : {
          name: 'Aldeia Oculta',
          bgGradient: 'from-[#0d1f1f] via-[#091515] to-[#040b0b]',
          border: 'border-teal-900/60',
          sealColor: 'bg-teal-950/80 text-teal-400 border-teal-700/80',
          textColor: 'text-teal-400',
        };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#121722] border ${factionTheme.border}`}>
        <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${factionTheme.sealColor} border`}>
          <span className="font-kanji">{role.kanji}</span>
        </div>
        <div>
          <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
            <span>{role.name}</span>
            {isSilenced && <span className="text-[10px] px-1 bg-red-900/80 text-red-300 rounded">SELADO</span>}
          </div>
          <div className={`text-[10px] font-mono ${factionTheme.textColor}`}>{factionTheme.name}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${factionTheme.border} bg-gradient-to-b ${factionTheme.bgGradient} p-4 shadow-xl text-left`}
    >
      <div className="absolute right-2 top-0 pointer-events-none opacity-10 text-8xl font-kanji select-none text-white">
        {role.kanji}
      </div>

      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-10 h-10 rounded border flex items-center justify-center font-bold text-lg shadow-inner ${factionTheme.sealColor}`}
          >
            <span className="font-kanji text-xl">{role.kanji}</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-100 tracking-wide flex items-center gap-1.5">
              <span>{role.name}</span>
              <Icon className="w-4 h-4 text-slate-400" />
            </h3>
            <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${factionTheme.textColor}`}>
              {factionTheme.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {usesRemaining !== undefined && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 border border-white/20 text-amber-300 font-bold">
              {usesRemaining} uso(s) restante(s)
            </span>
          )}
          {isSilenced && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 border border-red-600 text-red-300 font-bold animate-pulse">
              CHAKRA SELADO
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-300/90 italic mb-2.5 leading-relaxed">
        "{role.description}"
      </p>

      <div className="bg-black/40 border border-white/10 rounded p-2.5">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-1">
          Habilidade & Missão:
        </div>
        <p className="text-xs text-slate-200 leading-snug">
          {role.detailedSkill}
        </p>
      </div>
    </div>
  );
};

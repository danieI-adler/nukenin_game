import type { Player, GameState, ChatMessage } from '../types/game';
import { ROLES } from './roles';

const BOT_NAMES = [
  'Kageyama',
  'Hanzo',
  'Sasuke',
  'Shizuka',
  'Yagyu',
  'Minato',
  'Rin',
  'Kotaro',
  'Chiyo',
  'Jiraiya',
  'Tsunade',
  'Genji',
  'Kenshin',
  'Danzo',
  'Ayame',
];

const BOT_NINJA_CHAT_LINES: Record<string, string[]> = {
  SUSPICIOUS: [
    'Senti uma oscilação estranha de chakra vindo de {target} durante a noite...',
    'Por que {target} está tão calado? Tipico comportamento de infiltrado Nukenin!',
    '{target} agiu de forma muito suspeita na última votação.',
    'Minhas suspeitas recaem sobre {target}. O que você tem a declarar?',
    'Se {target} não falar nada em sua defesa, meu voto irá para ele!',
  ],
  DEFENSIVE: [
    'Eu sou um cidadão honrado da aldeia, parem de gastar votos em mim!',
    'Não comecem a me acusar sem provas, os verdadeiros Nukenin estão rindo agora!',
    'Meu chakra é limpo, juro pela minha honra shinobi!',
    'Se me eliminarem, a aldeia perderá um aliado crucial.',
  ],
  GENERAL: [
    'Precisamos focar nos votos e descobrir quem são os espiões.',
    'A noite passada foi tensa... temos que agir com sabedoria hoje.',
    'Que a proteção dos deuses shinobi esteja sobre nossa vila.',
    'Prestem atenção em quem está tentando manipular o debate!',
    'Quem o Investigador checou na noite passada? Compartilhe pistas!',
  ],
};

export class BotAI {
  public static generateBotName(existingPlayers: Player[]): string {
    const existingNames = new Set(existingPlayers.map((p) => p.name));
    for (const name of BOT_NAMES) {
      if (!existingNames.has(name)) {
        return name;
      }
    }
    return `Shinobi_${Math.floor(100 + Math.random() * 900)}`;
  }

  public static chooseNightAction(bot: Player, gameState: GameState): string | null {
    if (!bot.isAlive || bot.isSilenced || !bot.role) return null;

    const livingPlayers = gameState.players.filter((p) => p.isAlive);
    const otherLiving = livingPlayers.filter((p) => p.id !== bot.id);
    if (otherLiving.length === 0) return null;

    const roleDef = ROLES[bot.role];
    if (!roleDef.hasNightAction) return null;

    if (roleDef.faction === 'NUKENIN') {
      const nonNukenin = otherLiving.filter((p) => {
        if (!p.role) return true;
        return ROLES[p.role].faction !== 'NUKENIN';
      });
      const candidates = nonNukenin.length > 0 ? nonNukenin : otherLiving;
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      return target ? target.id : null;
    }

    if (bot.role === 'CURANDEIRO' || bot.role === 'ANJO' || bot.role === 'ESCUDEIRO') {
      const candidates = bot.role === 'ANJO' ? otherLiving : livingPlayers;
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      return target ? target.id : null;
    }

    if (bot.role === 'INVESTIGADOR') {
      const target = otherLiving[Math.floor(Math.random() * otherLiving.length)];
      return target ? target.id : null;
    }

    if (bot.role === 'SAMURAI') {
      if ((bot.usesRemaining ?? 1) > 0 && Math.random() < 0.4) {
        const target = otherLiving[Math.floor(Math.random() * otherLiving.length)];
        return target ? target.id : null;
      }
      return null;
    }

    if (bot.role === 'RENEGADO') {
      const target = otherLiving[Math.floor(Math.random() * otherLiving.length)];
      return target ? target.id : null;
    }

    return null;
  }

  public static chooseVote(bot: Player, gameState: GameState): string | null {
    if (!bot.isAlive) return null;

    const otherLiving = gameState.players.filter((p) => p.isAlive && p.id !== bot.id);
    if (otherLiving.length === 0) return null;

    if (bot.role && ROLES[bot.role].faction === 'NUKENIN') {
      const nonNukenin = otherLiving.filter((p) => p.role && ROLES[p.role].faction !== 'NUKENIN');
      const targetPool = nonNukenin.length > 0 ? nonNukenin : otherLiving;
      return targetPool[Math.floor(Math.random() * targetPool.length)].id;
    }

    return otherLiving[Math.floor(Math.random() * otherLiving.length)].id;
  }

  public static generateChatMessage(bot: Player, gameState: GameState): ChatMessage | null {
    if (!bot.isAlive) return null;

    const otherLiving = gameState.players.filter((p) => p.isAlive && p.id !== bot.id);
    if (otherLiving.length === 0) return null;

    const randomTarget = otherLiving[Math.floor(Math.random() * otherLiving.length)];
    const roll = Math.random();

    let template = '';
    if (roll < 0.4) {
      template = BOT_NINJA_CHAT_LINES.SUSPICIOUS[Math.floor(Math.random() * BOT_NINJA_CHAT_LINES.SUSPICIOUS.length)];
    } else if (roll < 0.7) {
      template = BOT_NINJA_CHAT_LINES.GENERAL[Math.floor(Math.random() * BOT_NINJA_CHAT_LINES.GENERAL.length)];
    } else {
      template = BOT_NINJA_CHAT_LINES.DEFENSIVE[Math.floor(Math.random() * BOT_NINJA_CHAT_LINES.DEFENSIVE.length)];
    }

    const content = template.replace('{target}', randomTarget.name);

    return {
      id: `bot-msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId: bot.id,
      senderName: bot.name,
      senderRole: bot.role,
      content,
      timestamp: Date.now(),
      channel: 'PUBLIC',
    };
  }
}

import type { RoleDefinition, RoleId } from '../types/game';

export const ROLES: Record<RoleId, RoleDefinition> = {
  CIVIL: {
    id: 'CIVIL',
    name: 'Civil (Aldeão)',
    kanji: '民',
    faction: 'ALDEIA',
    description: 'Um simples cidadão da vila shinobi que confia na sua astúcia.',
    detailedSkill: 'Não possui ação durante a noite. Durante o dia, seu voto e voz na discussão são vitais para expurgar os Nukenin.',
    hasNightAction: false,
    priority: 99,
    badgeColor: '#10b981',
    iconName: 'User',
  },
  INVESTIGADOR: {
    id: 'INVESTIGADOR',
    name: 'Investigador Shinobi',
    kanji: '探',
    faction: 'ALDEIA',
    description: 'Rastreia rastros de chakra nas sombras para descobrir a facção do alvo.',
    detailedSkill: 'Durante a noite, escolha um jogador para investigar. Descobre se ele pertence à Aldeia ou aos Nukenin/Neutros.',
    hasNightAction: true,
    priority: 2,
    badgeColor: '#3b82f6',
    iconName: 'Search',
  },
  CURANDEIRO: {
    id: 'CURANDEIRO',
    name: 'Curandeiro Ninja',
    kanji: '医',
    faction: 'ALDEIA',
    description: 'Mestre no jutsu médico que cura feridas mortais.',
    detailedSkill: 'Escolhe um jogador para proteger durante a noite. O alvo sobrevive a qualquer tentativa de assassinato naquela noite.',
    hasNightAction: true,
    priority: 3,
    badgeColor: '#14b8a6',
    iconName: 'HeartPulse',
  },
  ANJO: {
    id: 'ANJO',
    name: 'Anjo Guardião',
    kanji: '天',
    faction: 'ALDEIA',
    description: 'Guarda sagrado da vila com barreira divina de retaliação.',
    detailedSkill: 'Protege um jogador à noite. Se o alvo for atacado pelos Nukenin ou Renegado, um dos atacantes é fulminado instantaneamente!',
    hasNightAction: true,
    priority: 4,
    badgeColor: '#f59e0b',
    iconName: 'ShieldAlert',
  },
  ESCUDEIRO: {
    id: 'ESCUDEIRO',
    name: 'Escudeiro de Ferro',
    kanji: '盾',
    faction: 'ALDEIA',
    description: 'Portador do escudo espelhado que repele investidas inimigas.',
    detailedSkill: 'Escolhe um jogador (ou a si mesmo) para fortificar. Qualquer ataque direto desferido contra ele é refletido de volta para o agressor.',
    hasNightAction: true,
    priority: 4,
    badgeColor: '#64748b',
    iconName: 'ShieldCheck',
  },
  SAMURAI: {
    id: 'SAMURAI',
    name: 'Samurai Vingador',
    kanji: '侍',
    faction: 'ALDEIA',
    description: 'Espadachim lendário que executa um julgamento letal definitivo.',
    detailedSkill: 'Habilidade de USO ÚNICO (1x por partida): Durante a noite, pode desembainhar sua katana e eliminar qualquer suspeito.',
    hasNightAction: true,
    maxUses: 1,
    priority: 5,
    badgeColor: '#8b5cf6',
    iconName: 'Sword',
  },
  POLICIAL: {
    id: 'POLICIAL',
    name: 'Policial da Névoa',
    kanji: '警',
    faction: 'ALDEIA',
    description: 'Patrulha as ruas da vila e herda o espírito de combate dos caídos.',
    detailedSkill: 'Vigia a vila. Se o Samurai for eliminado, o Policial herda a lâmina e ganha 1 golpe letal de Samurai!',
    hasNightAction: false,
    priority: 6,
    badgeColor: '#0284c7',
    iconName: 'BadgeAlert',
  },
  ESPIRITO: {
    id: 'ESPIRITO',
    name: 'Espírito Vingativo',
    kanji: '霊',
    faction: 'ALDEIA',
    description: 'Alma ancestral ligada à vila que não parte para o além sem vingança.',
    detailedSkill: 'Se for executado pelo voto da vila durante o dia, seu espírito tem o poder de arrastar 1 jogador vivo para a tumba junto com ele!',
    hasNightAction: false,
    priority: 99,
    badgeColor: '#a855f7',
    iconName: 'Ghost',
  },
  ALDEAO_LIDER: {
    id: 'ALDEAO_LIDER',
    name: 'Aldeão Líder (Prefeito)',
    kanji: '長',
    faction: 'ALDEIA',
    description: 'A autoridade máxima respeitada por toda a comunidade.',
    detailedSkill: 'Não possui ação noturna, mas durante a votação do dia o seu voto tem PESO 2, podendo desempatar julgamentos críticos.',
    hasNightAction: false,
    priority: 99,
    badgeColor: '#eab308',
    iconName: 'Crown',
  },
  ASSASSINO: {
    id: 'ASSASSINO',
    name: 'Assassino Nukenin',
    kanji: '殺',
    faction: 'NUKENIN',
    description: 'Ninja renegado sedento pelo colapso da vila oculta.',
    detailedSkill: 'Vota e age com seus irmãos Nukenin durante a noite para escolher 1 jogador para ser assassinado nas sombras.',
    hasNightAction: true,
    priority: 5,
    badgeColor: '#dc2626',
    iconName: 'Flame',
  },
  SILENCIADOR: {
    id: 'SILENCIADOR',
    name: 'Silenciador (Ilusionista)',
    kanji: '封',
    faction: 'NUKENIN',
    description: 'Mestre em genjutsu de selamento que anula os movimentos inimigos.',
    detailedSkill: 'AGE PRIMEIRO: Durante a noite, sela o chakra de um jogador. O alvo é impedido de realizar qualquer ação noturna.',
    hasNightAction: true,
    priority: 1,
    badgeColor: '#b91c1c',
    iconName: 'Lock',
  },
  ESPIAO: {
    id: 'ESPIAO',
    name: 'Espião Nukenin',
    kanji: '諜',
    faction: 'NUKENIN',
    description: 'Infiltrado sutil capaz de desmascarar identidades secretas.',
    detailedSkill: 'Durante a noite, investiga um jogador e descobre com precisão cirúrgica o CARGO EXATO da vítima.',
    hasNightAction: true,
    priority: 2,
    badgeColor: '#991b1b',
    iconName: 'Eye',
  },
  APRENDIZ: {
    id: 'APRENDIZ',
    name: 'Aprendiz Renegado',
    kanji: '弟',
    faction: 'NUKENIN',
    description: 'Jovem discípulo oculto esperando sua vez de liderar o massacre.',
    detailedSkill: 'Conhece seus irmãos Nukenin. Se todos os Assassinos forem mortos, o Aprendiz desperta e assume o cargo de Assassino Nukenin!',
    hasNightAction: false,
    priority: 99,
    badgeColor: '#7f1d1d',
    iconName: 'Zap',
  },
  KAMIKAZE: {
    id: 'KAMIKAZE',
    name: 'Kamikaze Renegado',
    kanji: '爆',
    faction: 'NUKENIN',
    description: 'Portador de selos explosivos proibidos que sacrifica sua vida pelo clã.',
    detailedSkill: 'Habilidade de USO ÚNICO: Pode detonar seus selos à noite, sacrificando a própria vida para garantir a morte fulminante do alvo escolhido.',
    hasNightAction: true,
    maxUses: 1,
    priority: 5,
    badgeColor: '#ef4444',
    iconName: 'Bomb',
  },
  RENEGADO: {
    id: 'RENEGADO',
    name: 'Renegado Solitário (Rogue)',
    kanji: '狂',
    faction: 'NEUTRO',
    description: 'Um ninja sem mestre nem compaixão que luta apenas por si mesmo.',
    detailedSkill: 'Todas as noites pode eliminar 1 jogador à sua escolha. VENCE O JOGO SOZINHO se for o último shinobi vivo na vila!',
    hasNightAction: true,
    priority: 5,
    badgeColor: '#d97706',
    iconName: 'Skull',
  },
};

export function distributeRoles(playerCount: number, enabledRoleIds: RoleId[]): RoleId[] {
  const pool: RoleId[] = [];

  // Balanced proportion matching social deduction standards:
  // 4-5 players: exactly 1 Nukenin
  // 6-8 players: exactly 2 Nukenin
  // 9-11 players: 2 or 3 Nukenin
  // 12+ players: 3 to 4 Nukenin
  const nukeninCount =
    playerCount <= 5 ? 1 : playerCount <= 8 ? 2 : playerCount <= 11 ? 3 : 4;
  
  // Neutrals only in larger games (7+ players)
  const neutralCount = playerCount >= 7 && enabledRoleIds.includes('RENEGADO') ? 1 : 0;
  const villagerCount = playerCount - nukeninCount - neutralCount;

  const availableNukenin = enabledRoleIds.filter((id) => ROLES[id].faction === 'NUKENIN');
  const availableVillagers = enabledRoleIds.filter((id) => ROLES[id].faction === 'ALDEIA');

  // Add Nukenin roles (ensure at least 1 Assassin or Silenciador)
  const nukeninSelection: RoleId[] = [];
  if (availableNukenin.includes('ASSASSINO')) {
    nukeninSelection.push('ASSASSINO');
  }
  const otherNukenin = availableNukenin.filter((r) => r !== 'ASSASSINO');
  while (nukeninSelection.length < nukeninCount) {
    if (otherNukenin.length > 0) {
      const randomIdx = Math.floor(Math.random() * otherNukenin.length);
      nukeninSelection.push(otherNukenin.splice(randomIdx, 1)[0]);
    } else {
      nukeninSelection.push('ASSASSINO');
    }
  }

  // Add Neutrals if needed
  const neutralSelection: RoleId[] = [];
  if (neutralCount > 0) {
    neutralSelection.push('RENEGADO');
  }

  // Add Villagers: ALWAYS guarantee powerful investigation & defense roles (Investigador + Curandeiro/Anjo/Samurai)
  const villagerSelection: RoleId[] = [];
  const priorityVillagers: RoleId[] = [
    'INVESTIGADOR',
    'CURANDEIRO',
    'ANJO',
    'SAMURAI',
    'ALDEAO_LIDER',
    'ESCUDEIRO',
    'ESPIRITO',
    'POLICIAL',
  ].filter((r) => availableVillagers.includes(r as RoleId)) as RoleId[];

  const shuffledPriority = [...priorityVillagers].sort(() => Math.random() - 0.5);

  while (villagerSelection.length < villagerCount) {
    if (shuffledPriority.length > 0) {
      villagerSelection.push(shuffledPriority.pop()!);
    } else {
      villagerSelection.push('CIVIL');
    }
  }

  pool.push(...nukeninSelection, ...neutralSelection, ...villagerSelection);
  return pool.sort(() => Math.random() - 0.5);
}

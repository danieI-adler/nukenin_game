export type Faction = 'ALDEIA' | 'NUKENIN' | 'NEUTRO';

export type RoleId =
  | 'CIVIL'
  | 'INVESTIGADOR'
  | 'CURANDEIRO'
  | 'ANJO'
  | 'ESCUDEIRO'
  | 'SAMURAI'
  | 'POLICIAL'
  | 'ESPIRITO'
  | 'ALDEAO_LIDER'
  | 'ASSASSINO'
  | 'SILENCIADOR'
  | 'ESPIAO'
  | 'APRENDIZ'
  | 'KAMIKAZE'
  | 'RENEGADO';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  kanji: string;
  faction: Faction;
  description: string;
  detailedSkill: string;
  hasNightAction: boolean;
  maxUses?: number;
  isPassive?: boolean;
  priority: number;
  badgeColor: string;
  iconName: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isBot: boolean;
  isAlive: boolean;
  role?: RoleId;
  originalRole?: RoleId;
  avatarSeed: number;
  votesReceived: number;
  votedFor: string | null;
  nightActionTarget: string | null;
  isSilenced: boolean;
  isProtected: boolean;
  isShieldReflecting: boolean;
  usesRemaining?: number;
  hasNightAction?: boolean;
  deathCause?: string | null;
  deathNightOrDay?: number;
  isDancroxEasterEgg?: boolean;
}

export type GamePhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'NIGHT'
  | 'DAY_ANNOUNCEMENT'
  | 'DAY_DISCUSSION'
  | 'DAY_VOTING'
  | 'DAY_EXECUTION'
  | 'GAME_OVER';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: RoleId;
  senderFaction?: Faction;
  content: string;
  timestamp: number;
  channel: 'PUBLIC' | 'NUKENIN' | 'DEAD' | 'SYSTEM';
  isImportant?: boolean;
}

export interface RoomConfig {
  roomCode: string;
  hostId: string;
  nightDurationSeconds: number;
  dayDiscussionDurationSeconds: number;
  dayVotingDurationSeconds: number;
  revealRoleOnDeath: boolean;
  allowKamikazeRole: boolean;
  enabledRoles: RoleId[];
  minPlayers: number;
  maxPlayers: number;
}

export interface NightResolutionReport {
  nightNumber: number;
  silencedPlayerIds: string[];
  protectedPlayerIds: string[];
  eliminatedPlayers: {
    player: Player;
    cause: string;
  }[];
  investigationResults: {
    investigatorId: string;
    targetId: string;
    resultText: string;
  }[];
  reflectedAttacks: {
    attackerId: string;
    targetId: string;
  }[];
  narrative: string[];
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  dayNumber: number;
  timeRemaining: number;
  players: Player[];
  messages: ChatMessage[];
  winnerFaction: Faction | null;
  lastNightReport: NightResolutionReport | null;
  executedPlayer: Player | null;
  spiritTarget: Player | null;
  systemAnnouncements: string[];
}

export type NetworkMessage =
  | { type: 'JOIN_REQUEST'; name: string; avatarSeed: number }
  | { type: 'JOIN_ACCEPTED'; playerId: string; gameState: GameState; config: RoomConfig }
  | { type: 'STATE_UPDATE'; gameState: GameState }
  | { type: 'CHAT_MESSAGE'; message: ChatMessage }
  | { type: 'SUBMIT_NIGHT_ACTION'; targetId: string | null }
  | { type: 'SUBMIT_VOTE'; targetId: string | null }
  | { type: 'SUBMIT_SPIRIT_KILL'; targetId: string }
  | { type: 'TRIGGER_DANCROX'; playerId: string }
  | { type: 'START_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'CONFIG_UPDATE'; config: Partial<RoomConfig> }
  | { type: 'ADD_BOTS'; count: number };

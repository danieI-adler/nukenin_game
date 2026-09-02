import type { Player, RoleId, GameState, NightResolutionReport, Faction } from '../types/game';
import { ROLES } from './roles';

export class GameEngine {
  public static resolveNight(gameState: GameState): {
    updatedPlayers: Player[];
    report: NightResolutionReport;
  } {
    const players = gameState.players.map((p) => ({
      ...p,
      isSilenced: false,
      isProtected: false,
      isShieldReflecting: false,
    }));

    const report: NightResolutionReport = {
      nightNumber: gameState.dayNumber,
      silencedPlayerIds: [],
      protectedPlayerIds: [],
      eliminatedPlayers: [],
      investigationResults: [],
      reflectedAttacks: [],
      narrative: [],
    };

    const playerMap = new Map<string, Player>(players.map((p) => [p.id, p]));
    const livingPlayers = players.filter((p) => p.isAlive);

    // 1. PHASE 1: SILENCIADOR (Illusionist acts first)
    const silencers = livingPlayers.filter((p) => p.role === 'SILENCIADOR' && p.nightActionTarget);
    for (const silencer of silencers) {
      const target = playerMap.get(silencer.nightActionTarget!);
      if (target && target.isAlive) {
        target.isSilenced = true;
        report.silencedPlayerIds.push(target.id);
        report.narrative.push(`Um chakra denso de genjutsu selou as habilidades de um shinobi durante a noite.`);
      }
    }

    // 2. PHASE 2: INVESTIGATIONS (Detective & Spy)
    for (const p of livingPlayers) {
      if (p.isSilenced || !p.nightActionTarget) continue;
      const target = playerMap.get(p.nightActionTarget);
      if (!target) continue;

      if (p.role === 'INVESTIGADOR') {
        const isEvil = target.role && (ROLES[target.role].faction === 'NUKENIN' || ROLES[target.role].faction === 'NEUTRO');
        const factionResult = isEvil ? 'NUKENIN / AMEAÇA' : 'ALDEIA (INOCENTE)';
        report.investigationResults.push({
          investigatorId: p.id,
          targetId: target.id,
          resultText: `Sua investigação shinobi revelou que ${target.name} pertence à facção: [${factionResult}].`,
        });
      } else if (p.role === 'ESPIAO') {
        const targetRoleName = target.role ? ROLES[target.role].name : 'Desconhecido';
        report.investigationResults.push({
          investigatorId: p.id,
          targetId: target.id,
          resultText: `Seu espião infiltrou-se e descobriu que ${target.name} é exatamente o cargo: [${targetRoleName}] (${target.role ? ROLES[target.role].kanji : '?'}).`,
        });
      }
    }

    // 3. PHASE 3: DEFENSES (Healer, Angel, Shieldbearer)
    const protectedTargets = new Set<string>();
    const angelProtectedMap = new Map<string, string>();
    const shieldReflectMap = new Map<string, string>();

    for (const p of livingPlayers) {
      if (p.isSilenced || !p.nightActionTarget) continue;
      const target = playerMap.get(p.nightActionTarget);
      if (!target || !target.isAlive) continue;

      if (p.role === 'CURANDEIRO') {
        protectedTargets.add(target.id);
        target.isProtected = true;
        report.protectedPlayerIds.push(target.id);
      } else if (p.role === 'ANJO') {
        protectedTargets.add(target.id);
        target.isProtected = true;
        angelProtectedMap.set(target.id, p.id);
        report.protectedPlayerIds.push(target.id);
      } else if (p.role === 'ESCUDEIRO') {
        shieldReflectMap.set(target.id, p.id);
        target.isShieldReflecting = true;
      }
    }

    // 4. PHASE 4: ATTACKS (Nukenin collective, Samurai blade, Kamikaze explosion, Rogue)
    interface AttackEvent {
      attackerId: string;
      attackerRole: RoleId;
      targetId: string;
      isGuaranteedKill?: boolean;
    }

    const incomingAttacks: AttackEvent[] = [];

    // Nukenin Collective Target
    const nukeninAttackers = livingPlayers.filter(
      (p) => !p.isSilenced && (p.role === 'ASSASSINO' || p.role === 'SILENCIADOR' || p.role === 'ESPIAO' || p.role === 'APRENDIZ')
    );
    const nukeninTargets: Record<string, number> = {};
    for (const nuke of nukeninAttackers) {
      if (nuke.nightActionTarget) {
        nukeninTargets[nuke.nightActionTarget] = (nukeninTargets[nuke.nightActionTarget] || 0) + 1;
      }
    }

    let topNukeninTarget: string | null = null;
    let maxVotes = 0;
    for (const [targetId, count] of Object.entries(nukeninTargets)) {
      if (count > maxVotes) {
        maxVotes = count;
        topNukeninTarget = targetId;
      }
    }

    if (topNukeninTarget && nukeninAttackers.length > 0) {
      const mainAttacker = nukeninAttackers.find((p) => p.role === 'ASSASSINO') || nukeninAttackers[0];
      incomingAttacks.push({
        attackerId: mainAttacker.id,
        attackerRole: mainAttacker.role!,
        targetId: topNukeninTarget,
      });
    }

    // Samurai Blade (1x use)
    for (const p of livingPlayers) {
      if ((p.role === 'SAMURAI' || p.role === 'POLICIAL') && p.nightActionTarget && !p.isSilenced) {
        if ((p.usesRemaining ?? 1) > 0) {
          p.usesRemaining = (p.usesRemaining ?? 1) - 1;
          incomingAttacks.push({
            attackerId: p.id,
            attackerRole: p.role,
            targetId: p.nightActionTarget,
          });
          report.narrative.push(`O brilho prateado de uma katana cortou a escuridão da noite.`);
        }
      }
    }

    // Kamikaze Suicide Bomb (1x use)
    for (const p of livingPlayers) {
      if (p.role === 'KAMIKAZE' && p.nightActionTarget && !p.isSilenced) {
        if ((p.usesRemaining ?? 1) > 0) {
          p.usesRemaining = 0;
          p.isAlive = false;
          p.deathCause = 'Detonação de Selos Explosivos (Kamikaze)';
          p.deathNightOrDay = gameState.dayNumber;
          report.eliminatedPlayers.push({
            player: p,
            cause: 'Morreu em sua própria explosão suicida.',
          });
          report.narrative.push(`Uma explosão devastadora abalou as estruturas da vila.`);

          incomingAttacks.push({
            attackerId: p.id,
            attackerRole: 'KAMIKAZE',
            targetId: p.nightActionTarget,
            isGuaranteedKill: true,
          });
        }
      }
    }

    // Renegado Attack
    for (const p of livingPlayers) {
      if (p.role === 'RENEGADO' && p.nightActionTarget && !p.isSilenced) {
        incomingAttacks.push({
          attackerId: p.id,
          attackerRole: 'RENEGADO',
          targetId: p.nightActionTarget,
        });
      }
    }

    // 5. RESOLVE ATTACKS AGAINST DEFENSES
    const pendingDeaths = new Set<string>();

    for (const attack of incomingAttacks) {
      const target = playerMap.get(attack.targetId);
      const attacker = playerMap.get(attack.attackerId);
      if (!target || !target.isAlive) continue;

      // 5.1 Shieldbearer Reflection
      if (shieldReflectMap.has(target.id) && attacker && attacker.id !== target.id) {
        report.reflectedAttacks.push({
          attackerId: attacker.id,
          targetId: target.id,
        });
        report.narrative.push(`O escudo do Escudeiro refletiu o ataque diretamente contra o agressor!`);
        pendingDeaths.add(attacker.id);
        attacker.deathCause = `Ataque refletido pelo Escudeiro de Ferro`;
        continue;
      }

      // 5.2 Angel Divine Retaliation
      if (angelProtectedMap.has(target.id) && attacker && attacker.id !== target.id) {
        report.narrative.push(`A barreira divina do Anjo protegeu ${target.name} e fulminou o atacante!`);
        pendingDeaths.add(attacker.id);
        attacker.deathCause = `Fulminado pela barreira divina do Anjo Guardião`;
        continue;
      }

      // 5.3 Healer Regular Protection
      if (protectedTargets.has(target.id) && !attack.isGuaranteedKill) {
        report.narrative.push(`Um shinobi sobreviveu a um ataque mortal graças aos cuidados médicos na noite.`);
        continue;
      }

      // 5.4 Normal elimination
      pendingDeaths.add(target.id);
      target.deathCause =
        attack.attackerRole === 'ASSASSINO'
          ? 'Emboscada dos Ninjas Nukenin'
          : attack.attackerRole === 'SAMURAI'
          ? 'Julgamento da Katana do Samurai'
          : attack.attackerRole === 'KAMIKAZE'
          ? 'Explosão fatal de Selos Proibidos'
          : attack.attackerRole === 'RENEGADO'
          ? 'Golpe sorrateiro do Renegado Solitário'
          : 'Ataque nas sombras';
    }

    for (const deathId of pendingDeaths) {
      const p = playerMap.get(deathId);
      if (p && p.isAlive) {
        p.isAlive = false;
        p.deathNightOrDay = gameState.dayNumber;
        report.eliminatedPlayers.push({
          player: p,
          cause: p.deathCause || 'Eliminado durante a noite.',
        });
      }
    }

    // 6. INHERITANCE LOGIC
    const isSamuraiDead = players.some((p) => p.role === 'SAMURAI' && !p.isAlive);
    if (isSamuraiDead) {
      const police = players.find((p) => p.role === 'POLICIAL' && p.isAlive);
      if (police && (police.usesRemaining === undefined || police.usesRemaining === 0)) {
        police.usesRemaining = 1;
        police.hasNightAction = true;
        report.narrative.push(`Com a queda do Samurai, o Policial da Névoa empunha a lâmina da justiça!`);
      }
    }

    const livingAssassins = players.filter((p) => p.role === 'ASSASSINO' && p.isAlive);
    if (livingAssassins.length === 0) {
      const apprentice = players.find((p) => p.role === 'APRENDIZ' && p.isAlive);
      if (apprentice) {
        apprentice.role = 'ASSASSINO';
        report.narrative.push(`O Aprendiz Renegado assumiu o manto de Assassino dos Nukenin!`);
      }
    }

    players.forEach((p) => {
      p.nightActionTarget = null;
    });

    return {
      updatedPlayers: players,
      report,
    };
  }

  public static resolveVoting(players: Player[]): {
    updatedPlayers: Player[];
    executedPlayer: Player | null;
    tie: boolean;
  } {
    const playerMap = new Map(players.map((p) => [p.id, p]));
    const voteCounts: Record<string, number> = {};

    players.forEach((p) => {
      p.votesReceived = 0;
    });

    players.forEach((voter) => {
      if (!voter.isAlive || !voter.votedFor) return;
      const target = playerMap.get(voter.votedFor);
      if (!target || !target.isAlive) return;

      const weight = voter.role === 'ALDEAO_LIDER' ? 2 : 1;
      voteCounts[target.id] = (voteCounts[target.id] || 0) + weight;
      target.votesReceived += weight;
    });

    let maxVotes = 0;
    let topTargetId: string | null = null;
    let isTie = false;

    for (const [targetId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        topTargetId = targetId;
        isTie = false;
      } else if (count === maxVotes && count > 0) {
        isTie = true;
      }
    }

    if (!isTie && topTargetId && maxVotes > 0) {
      const executed = playerMap.get(topTargetId)!;
      executed.isAlive = false;
      executed.deathCause = 'Condenado e executado em praça pública pelo conselho da vila';
      return {
        updatedPlayers: players,
        executedPlayer: executed,
        tie: false,
      };
    }

    return {
      updatedPlayers: players,
      executedPlayer: null,
      tie: isTie,
    };
  }

  public static checkWinner(players: Player[]): Faction | null {
    const living = players.filter((p) => p.isAlive);
    if (living.length === 0) return null;

    const livingNukenin = living.filter((p) => p.role && ROLES[p.role].faction === 'NUKENIN').length;
    const livingAldeia = living.filter((p) => p.role && ROLES[p.role].faction === 'ALDEIA').length;
    const livingNeutro = living.filter((p) => p.role && ROLES[p.role].faction === 'NEUTRO').length;

    // 1. Rogue Solo Win
    if (living.length === 1 && living[0].role === 'RENEGADO') {
      return 'NEUTRO';
    }

    // 2. Aldeia Win (All evil/neutrals eliminated)
    if (livingNukenin === 0 && livingNeutro === 0 && livingAldeia > 0) {
      return 'ALDEIA';
    }

    // 3. Nukenin Win
    // If Nukenin >= livingAldeia + livingNeutro, check if Mayor (with 2 votes) could still tie/eliminate
    const hasMayorAlive = living.some((p) => p.role === 'ALDEAO_LIDER' && p.isAlive);
    if (livingNukenin > 0 && (livingNukenin > livingAldeia + livingNeutro || (livingNukenin === livingAldeia + livingNeutro && !hasMayorAlive))) {
      return 'NUKENIN';
    }

    return null;
  }
}

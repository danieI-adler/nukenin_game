import { joinRoom, selfId, type Room, type MessageAction, type MessageContext } from 'trystero';
import type { GameState, ChatMessage, Player } from '../types/game';

export interface PeerManagerEvents {
  onStateUpdate: (state: GameState) => void;
  onChatMessage: (message: ChatMessage) => void;
  onPlayerJoinRequest?: (player: Player, peerId: string) => void;
  onPeerJoin?: (peerId: string) => void;
  onPeerLeave?: (peerId: string) => void;
  onNightActionReceived?: (playerId: string, targetId: string | null) => void;
  onVoteReceived?: (playerId: string, targetId: string | null) => void;
  onPeerError?: (err: string) => void;
  onConnectedToRoom?: () => void;
}

export class PeerManager {
  private room: Room | null = null;
  private isHost: boolean = false;
  private events: PeerManagerEvents;
  private myPlayer: Player | null = null;
  public myPeerId: string = selfId;

  // Actions
  private stateAction: MessageAction | null = null;
  private chatAction: MessageAction | null = null;
  private joinReqAction: MessageAction | null = null;
  private nightActionAction: MessageAction | null = null;
  private voteAction: MessageAction | null = null;

  constructor(events: PeerManagerEvents) {
    this.events = events;
  }

  /**
   * Connect to room with Room Code via WebRTC Serverless Mesh (Trystero)
   */
  public initRoom(roomCode: string, player: Player, isHost: boolean): Promise<string> {
    this.isHost = isHost;
    this.myPlayer = player;
    const sanitizedCode = roomCode.trim().toUpperCase();

    return new Promise((resolve) => {
      try {
        this.room = joinRoom(
          {
            appId: 'nkn-shinobi-social-game',
            rtcConfig: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' },
              ],
            },
          },
          sanitizedCode
        );

        // Bind Action Channels
        this.stateAction = this.room.makeAction('state');
        this.chatAction = this.room.makeAction('chat');
        this.joinReqAction = this.room.makeAction('joinReq');
        this.nightActionAction = this.room.makeAction('nightAction');
        this.voteAction = this.room.makeAction('vote');

        this.stateAction.onMessage = (state: unknown) => {
          this.events.onStateUpdate(state as GameState);
        };

        this.chatAction.onMessage = (msg: unknown) => {
          this.events.onChatMessage(msg as ChatMessage);
        };

        this.joinReqAction.onMessage = (req: unknown, context: MessageContext) => {
          if (this.isHost && this.events.onPlayerJoinRequest) {
            const data = req as { name: string; avatarSeed: number; peerId: string };
            const newPlayer: Player = {
              id: data.peerId || context.peerId,
              name: data.name,
              avatarSeed: data.avatarSeed,
              isHost: false,
              isBot: false,
              isAlive: true,
              votesReceived: 0,
              votedFor: null,
              nightActionTarget: null,
              isSilenced: false,
              isProtected: false,
              isShieldReflecting: false,
            };
            this.events.onPlayerJoinRequest(newPlayer, context.peerId);
          }
        };

        this.nightActionAction.onMessage = (data: unknown) => {
          if (this.isHost && this.events.onNightActionReceived) {
            const payload = data as { playerId: string; targetId: string | null };
            this.events.onNightActionReceived(payload.playerId, payload.targetId);
          }
        };

        this.voteAction.onMessage = (data: unknown) => {
          if (this.isHost && this.events.onVoteReceived) {
            const payload = data as { playerId: string; targetId: string | null };
            this.events.onVoteReceived(payload.playerId, payload.targetId);
          }
        };

        // Room lifecycle events
        this.room.onPeerJoin = (peerId: string) => {
          if (this.events.onPeerJoin) {
            this.events.onPeerJoin(peerId);
          }

          // If client, announce presence by sending join request
          if (!this.isHost && this.joinReqAction && this.myPlayer) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this.joinReqAction as any).send({
              name: this.myPlayer.name,
              avatarSeed: this.myPlayer.avatarSeed,
              peerId: this.myPeerId,
            });
          }
        };

        this.room.onPeerLeave = (peerId: string) => {
          if (this.events.onPeerLeave) {
            this.events.onPeerLeave(peerId);
          }
        };

        if (this.events.onConnectedToRoom) {
          this.events.onConnectedToRoom();
        }

        resolve(this.myPeerId);
      } catch (err) {
        console.error('Trystero room connection error:', err);
        if (this.events.onPeerError) {
          this.events.onPeerError(`Falha ao conectar à sala P2P: ${String(err)}`);
        }
        resolve(this.myPeerId);
      }
    });
  }

  public broadcastState(gameState: GameState, targetPeerId?: string) {
    if (this.stateAction) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const action = this.stateAction as any;
      if (targetPeerId) {
        action.send(gameState, { target: targetPeerId });
      } else {
        action.send(gameState);
      }
    }
  }

  public broadcastChat(message: ChatMessage) {
    if (this.chatAction) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.chatAction as any).send(message);
    }
  }

  public submitNightAction(playerId: string, targetId: string | null) {
    if (this.nightActionAction) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.nightActionAction as any).send({ playerId, targetId });
    }
  }

  public submitVote(playerId: string, targetId: string | null) {
    if (this.voteAction) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.voteAction as any).send({ playerId, targetId });
    }
  }

  public leave() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }
}

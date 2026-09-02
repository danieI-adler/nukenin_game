import Peer, { type DataConnection } from 'peerjs';
import type { NetworkMessage, GameState, RoomConfig, ChatMessage, Player } from '../types/game';

export interface PeerManagerEvents {
  onStateUpdate: (state: GameState) => void;
  onChatMessage: (message: ChatMessage) => void;
  onPlayerJoinRequest?: (player: Player, conn: DataConnection) => void;
  onPeerError: (err: string) => void;
  onConnectedToHost?: () => void;
}

export class PeerManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private isHost: boolean = false;
  private events: PeerManagerEvents;

  constructor(events: PeerManagerEvents) {
    this.events = events;
  }

  public createRoom(roomCode: string, _hostPlayer?: Player): Promise<string> {
    this.isHost = true;
    const peerId = `nkn-shinobi-${roomCode.toLowerCase()}`;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          conn.on('open', () => {
            this.connections.set(conn.peer, conn);
          });

          conn.on('data', (data) => {
            this.handleIncomingDataAsHost(data as NetworkMessage);
          });

          conn.on('close', () => {
            this.connections.delete(conn.peer);
          });

          conn.on('error', (err) => {
            console.warn('Connection error:', err);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('Peer host warning:', err);
          resolve(peerId);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public joinRoom(roomCode: string, player: Player, _config?: RoomConfig): Promise<void> {
    this.isHost = false;
    const hostPeerId = `nkn-shinobi-${roomCode.toLowerCase()}`;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          debug: 1,
        });

        this.peer.on('open', () => {
          if (!this.peer) return;
          const conn = this.peer.connect(hostPeerId, {
            reliable: true,
          });

          conn.on('open', () => {
            this.hostConnection = conn;
            if (this.events.onConnectedToHost) {
              this.events.onConnectedToHost();
            }

            const joinMsg: NetworkMessage = {
              type: 'JOIN_REQUEST',
              name: player.name,
              avatarSeed: player.avatarSeed,
            };
            conn.send(joinMsg);
            resolve();
          });

          conn.on('data', (data) => {
            this.handleIncomingDataAsClient(data as NetworkMessage);
          });

          conn.on('error', (err) => {
            this.events.onPeerError(`Erro ao conectar à sala ${roomCode}: ${err.type || 'Anfitrião não encontrado'}`);
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          this.events.onPeerError(`Falha na conexão Peer: ${err.message || 'Serviço indisponível'}`);
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  public broadcastState(gameState: GameState) {
    if (!this.isHost) return;
    const msg: NetworkMessage = {
      type: 'STATE_UPDATE',
      gameState,
    };
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  public broadcastChat(message: ChatMessage) {
    if (!this.isHost) return;
    const msg: NetworkMessage = {
      type: 'CHAT_MESSAGE',
      message,
    };
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  public sendToHost(msg: NetworkMessage) {
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(msg);
    }
  }

  private handleIncomingDataAsHost(data: NetworkMessage) {
    if (data.type === 'CHAT_MESSAGE') {
      this.events.onChatMessage(data.message);
    }
  }

  private handleIncomingDataAsClient(data: NetworkMessage) {
    if (data.type === 'STATE_UPDATE') {
      this.events.onStateUpdate(data.gameState);
    } else if (data.type === 'CHAT_MESSAGE') {
      this.events.onChatMessage(data.message);
    }
  }

  public destroy() {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

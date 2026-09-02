import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Player, GamePhase } from '../../types/game';
import { ROLES } from '../../engine/roles';
import { Send, MessageSquare, Flame, Ghost } from 'lucide-react';
import { sfx } from '../../audio/soundEffects';

interface ShinobiChatProps {
  messages: ChatMessage[];
  currentPlayer: Player;
  phase: GamePhase;
  onSendMessage: (content: string, channel: 'PUBLIC' | 'NUKENIN' | 'DEAD') => void;
  onTriggerDancrox: () => void;
}

export const ShinobiChat: React.FC<ShinobiChatProps> = ({
  messages,
  currentPlayer,
  phase,
  onSendMessage,
  onTriggerDancrox,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'PUBLIC' | 'NUKENIN' | 'DEAD'>('PUBLIC');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isNukenin = currentPlayer.role && ROLES[currentPlayer.role]?.faction === 'NUKENIN';
  const isDead = !currentPlayer.isAlive;
  const isNight = phase === 'NIGHT';

  useEffect(() => {
    if (isDead) {
      setActiveTab('DEAD');
    }
  }, [isDead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (inputText.trim().toLowerCase().includes('dancrox') || inputText.trim() === '/nkn') {
      sfx.playDancroxLegendary();
      onTriggerDancrox();
    }

    onSendMessage(inputText.trim(), activeTab);
    setInputText('');
    sfx.playParchment();
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'PUBLIC') {
      return m.channel === 'PUBLIC' || m.channel === 'SYSTEM';
    }
    if (activeTab === 'NUKENIN') {
      return m.channel === 'NUKENIN';
    }
    if (activeTab === 'DEAD') {
      return m.channel === 'DEAD';
    }
    return true;
  });

  const canSendInCurrentTab = () => {
    if (activeTab === 'DEAD') return isDead;
    if (activeTab === 'NUKENIN') return isNukenin && currentPlayer.isAlive;
    if (activeTab === 'PUBLIC') return currentPlayer.isAlive && !isNight;
    return false;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#121722]/90 border border-[#222b3d] rounded-xl overflow-hidden backdrop-blur-md">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-[#222b3d] bg-[#0b0d12]/80 px-2 pt-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('PUBLIC');
              sfx.playParchment();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
              activeTab === 'PUBLIC'
                ? 'bg-[#121722] text-amber-400 border-[#222b3d] border-b-transparent'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Praça Pública</span>
          </button>

          {isNukenin && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('NUKENIN');
                sfx.playParchment();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
                activeTab === 'NUKENIN'
                  ? 'bg-[#2b0d0d] text-red-400 border-red-900/80 border-b-transparent'
                  : 'text-red-400/60 hover:text-red-300 border-transparent'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>Clã Nukenin</span>
            </button>
          )}

          {isDead && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('DEAD');
                sfx.playParchment();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
                activeTab === 'DEAD'
                  ? 'bg-[#1b152b] text-purple-300 border-purple-900/80 border-b-transparent'
                  : 'text-purple-400/60 hover:text-purple-300 border-transparent'
              }`}
            >
              <Ghost className="w-3.5 h-3.5 text-purple-400" />
              <span>Além-Túmulo</span>
            </button>
          )}
        </div>

        <span className="text-[10px] font-mono text-slate-500 px-2 pb-1">
          {activeTab === 'PUBLIC' ? (isNight ? 'Silêncio na Noite' : 'Voz Livre') : activeTab}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[220px] max-h-[380px] bg-[#0c1017]/50">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs py-8">
            <span className="font-kanji text-2xl mb-1 text-slate-700">靜</span>
            <span>Nenhum sussurro registrado neste pergaminho ainda...</span>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSystem = msg.channel === 'SYSTEM';
            const isMe = msg.senderId === currentPlayer.id;

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="px-3 py-1.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs text-center font-mono my-1 leading-relaxed"
                >
                  <span className="font-bold">📜 Anúncio dos Anciãos:</span> {msg.content}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">{msg.senderName}</span>
                  {msg.senderRole && (
                    <span className="text-[9px] px-1 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-mono">
                      {ROLES[msg.senderRole]?.name || msg.senderRole}
                    </span>
                  )}
                  <span className="text-slate-600 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs leading-relaxed max-w-[85%] break-words ${
                    isMe
                      ? 'bg-[#1e293b] text-slate-100 border border-slate-700'
                      : activeTab === 'NUKENIN'
                      ? 'bg-[#2b0d0d] text-red-200 border border-red-900/60'
                      : activeTab === 'DEAD'
                      ? 'bg-[#1a1329] text-purple-200 border border-purple-900/60'
                      : 'bg-[#161c28] text-slate-200 border border-[#242d3d]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-2.5 bg-[#0b0d12] border-t border-[#222b3d] flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!canSendInCurrentTab()}
          placeholder={
            !currentPlayer.isAlive && activeTab !== 'DEAD'
              ? 'Espíritos mortos só podem falar no canal Além-Túmulo...'
              : isNight && activeTab === 'PUBLIC'
              ? 'A noite exige silêncio total na praça da vila...'
              : activeTab === 'NUKENIN'
              ? 'Conspire em segredo com seus aliados Nukenin...'
              : 'Digite sua mensagem ou suspeita...'
          }
          className="flex-1 bg-[#161c28] border border-[#242d3d] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/70 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!canSendInCurrentTab() || !inputText.trim()}
          className="px-3.5 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};

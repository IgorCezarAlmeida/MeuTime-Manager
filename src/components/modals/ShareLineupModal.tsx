import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lineup, Match } from '../../types';
import { X, Copy, Check, Share2 } from 'lucide-react';

interface ShareLineupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineup: Lineup | null;
  match?: Match | null;
}

export const ShareLineupModal: React.FC<ShareLineupModalProps> = ({
  isOpen,
  onClose,
  lineup,
  match,
}) => {
  const { activeTeam, players } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lineup || !activeTeam) return null;

  const playersMap = Object.fromEntries(players.map((p) => [p.id, p]));

  // Generate formatted WhatsApp card
  const matchInfo = match
    ? `🏆 Jogo: ${activeTeam.nome} vs ${match.adversario}\n📅 Data: ${match.data} às ${match.horario}\n📍 Local: ${match.local}\n`
    : `📋 Escalação Oficial - ${activeTeam.nome}\n`;

  const startersList = lineup.titulares
    .map((slot, idx) => {
      const pl = slot.jogadorId ? playersMap[slot.jogadorId] : null;
      if (pl) {
        return `${idx + 1}. [${slot.positionName}] #${pl.numero} ${pl.apelido || pl.nome}`;
      }
      return `${idx + 1}. [${slot.positionName}] Em aberto`;
    })
    .join('\n');

  const benchList =
    lineup.reservasIds.length > 0
      ? '\n\n🔄 BANCO DE RESERVAS:\n' +
        lineup.reservasIds
          .map((id) => {
            const pl = playersMap[id];
            return pl ? `• #${pl.numero} ${pl.apelido || pl.nome} (${pl.posicao})` : '';
          })
          .filter(Boolean)
          .join('\n')
      : '';

  const shareText = `⚽ *MEUTIME MANAGER* ⚽\n${matchInfo}\n📐 Formação: *${lineup.formacao}*\n\n🔥 *TITULARES:*\n${startersList}${benchList}\n\n💬 *Orientações:* Chegar com 40 min de antecedência. Uniforme oficial.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-500" />
              Compartilhar Escalação
            </h2>
            <p className="text-xs text-slate-500">Pronto para envio no grupo da equipe</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner max-h-[340px] overflow-y-auto">
            {shareText}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado para o Clipboard!' : 'Copiar para WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, KeyRound, CheckCircle, UserCheck } from 'lucide-react';

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({ isOpen, onClose }) => {
  const { joinTeamWithInviteCode, activeTeam, players, currentUser, linkPlayerAccount } = useApp();
  const [inviteCode, setInviteCode] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Unlinked players in the current team
  const unlinkedPlayers = activeTeam
    ? players.filter((p) => p.timeId === activeTeam.id && !p.usuarioUid)
    : [];

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setFeedback({ type: 'error', message: 'Informe o código de convite.' });
      return;
    }

    const result = joinTeamWithInviteCode(inviteCode.trim());
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setInviteCode('');
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleLinkAccount = () => {
    if (!selectedPlayerId) {
      setFeedback({ type: 'error', message: 'Selecione seu cadastro na lista.' });
      return;
    }

    linkPlayerAccount(selectedPlayerId, currentUser.uid);
    setFeedback({
      type: 'success',
      message: `Conta de ${currentUser.nome} vinculada com sucesso ao cadastro esportivo!`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Vínculo de Atleta & Convite
            </h2>
            <p className="text-xs text-slate-500">Caso de Uso UC03 · Conta de Jogador</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300'
              }`}
            >
              {feedback.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Section 1: Enter Team by Invite Code */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Entrar em Equipe via Código
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Digite o código fornecido pelo seu técnico (ex: <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">GV-2026</code> ou <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">TBC-305</code>):
            </p>

            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <input
                type="text"
                placeholder="Código (Ex: GV-2026)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white uppercase font-mono font-bold tracking-wider"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
              >
                Conectar
              </button>
            </form>
          </div>

          {/* Section 2: Link current account to a player profile registered by coach */}
          {activeTeam && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Vincular Conta ao Elenco do {activeTeam.nome}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Se o técnico já cadastrou você manualmente no time, selecione sua ficha abaixo para sincronizar suas presenças e estatísticas:
              </p>

              {unlinkedPlayers.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Todos os atletas cadastrados nesta equipe já possuem vínculo ativo.
                </p>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="">Selecione o seu nome no elenco...</option>
                    {unlinkedPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.numero} · {p.nome} ({p.posicao})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleLinkAccount}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Confirmar Vínculo de Jogador
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Match, GoalEvent } from '../../types';
import { X, Trophy, Plus, Trash2 } from 'lucide-react';

interface MatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const { updateMatchResult, players, activeTeam } = useApp();

  const [placarTime, setPlacarTime] = useState<number>(match?.resultado?.placarTime ?? 0);
  const [placarAdversario, setPlacarAdversario] = useState<number>(match?.resultado?.placarAdversario ?? 0);
  const [gols, setGols] = useState<GoalEvent[]>(match?.resultado?.golsMarcados ?? []);
  const [destaqueId, setDestaqueId] = useState<string>(match?.resultado?.destaqueJogadorId ?? '');
  const [observacao, setObservacao] = useState<string>(match?.resultado?.observacaoPosJogo ?? '');

  if (!isOpen || !match || !activeTeam) return null;

  const teamPlayers = players.filter((p) => p.timeId === activeTeam.id);

  const handleAddGoal = () => {
    if (teamPlayers.length === 0) return;
    const first = teamPlayers[0];
    setGols((prev) => [
      ...prev,
      {
        jogadorId: first.id,
        jogadorNome: first.nome,
        minuto: `${Math.floor(Math.random() * 80) + 10}'`,
      },
    ]);
  };

  const handleRemoveGoal = (index: number) => {
    setGols((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateGoalPlayer = (index: number, playerId: string) => {
    const pl = teamPlayers.find((p) => p.id === playerId);
    if (!pl) return;
    setGols((prev) =>
      prev.map((g, i) => (i === index ? { ...g, jogadorId: pl.id, jogadorNome: pl.nome } : g))
    );
  };

  const handleUpdateGoalMinute = (index: number, minute: string) => {
    setGols((prev) => prev.map((g, i) => (i === index ? { ...g, minuto: minute } : g)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMatchResult(match.id, {
      placarTime: Number(placarTime),
      placarAdversario: Number(placarAdversario),
      golsMarcados: gols,
      destaqueJogadorId: destaqueId || undefined,
      observacaoPosJogo: observacao.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Súmula & Resultado
            </h2>
            <p className="text-xs text-slate-500">
              {activeTeam.nome} vs {match.adversario}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scorecard Inputs */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 block">
              Placar Final
            </span>
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {activeTeam.nome}
                </span>
                <input
                  type="number"
                  min="0"
                  value={placarTime}
                  onChange={(e) => setPlacarTime(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center text-3xl font-athletic font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-1 mt-1 text-slate-900 dark:text-white tabular-nums mx-auto block"
                />
              </div>

              <span className="text-2xl font-bold text-slate-400">×</span>

              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {match.adversario}
                </span>
                <input
                  type="number"
                  min="0"
                  value={placarAdversario}
                  onChange={(e) => setPlacarAdversario(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center text-3xl font-athletic font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-1 mt-1 text-slate-900 dark:text-white tabular-nums mx-auto block"
                />
              </div>
            </div>
          </div>

          {/* Goalscorers / Points scorers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {activeTeam.esporte === 'basquete' ? 'Pontuadores / Cestas' : 'Gols Marcados pela Equipe'}
              </label>
              <button
                type="button"
                onClick={handleAddGoal}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {gols.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum marcador registrado ainda.</p>
            ) : (
              <div className="space-y-2">
                {gols.map((g, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={g.jogadorId}
                      onChange={(e) => handleUpdateGoalPlayer(idx, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
                    >
                      {teamPlayers.map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.numero} - {p.nome} ({p.posicao})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Minuto (ex: 35')"
                      value={g.minuto || ''}
                      onChange={(e) => handleUpdateGoalMinute(idx, e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Player of the match */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Craque do Jogo / Destaque
            </label>
            <select
              value={destaqueId}
              onChange={(e) => setDestaqueId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="">Selecione o destaque (opcional)</option>
              {teamPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.numero} · {p.nome} ({p.posicao})
                </option>
              ))}
            </select>
          </div>

          {/* Coach's post-match notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Avaliação do Técnico pós-jogo
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Bom volume de jogo no primeiro tempo. Atenção na recomposição defensiva..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Salvar Resultado e Súmula</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

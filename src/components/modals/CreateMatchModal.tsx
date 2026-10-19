import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MatchType } from '../../types';
import { X, CalendarPlus } from 'lucide-react';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ isOpen, onClose }) => {
  const { createMatch, activeTeam } = useApp();

  const [adversario, setAdversario] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('10:00');
  const [local, setLocal] = useState('');
  const [tipo, setTipo] = useState<MatchType>('campeonato');
  const [observacoes, setObservacoes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !activeTeam) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adversario.trim()) {
      setError('Informe o adversário.');
      return;
    }
    if (!data) {
      setError('Informe a data da partida.');
      return;
    }
    if (!local.trim()) {
      setError('Informe o local da partida.');
      return;
    }

    try {
      createMatch({
        adversario: adversario.trim(),
        data,
        horario,
        local: local.trim(),
        tipo,
        status: 'agendada',
        observacoes: observacoes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao agendar partida');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Nova Partida
            </h2>
            <p className="text-xs text-slate-500">Agendar confronto para {activeTeam.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Equipe Adversária *
            </label>
            <input
              type="text"
              placeholder="Ex: União Bela Vista FC"
              value={adversario}
              onChange={(e) => setAdversario(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data do Jogo *
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Horário *
              </label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Local do Confronto *
            </label>
            <input
              type="text"
              placeholder="Ex: Arena Soccer Vila Mariana - Campo 2"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Partida
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as MatchType)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="campeonato">Campeonato Oficial</option>
              <option value="amistoso">Amistoso Preparatório</option>
              <option value="torneio">Torneio / Festival</option>
              <option value="eliminatoria">Mata-Mata / Decisão</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Orientações aos Atletas (Uniforme, Chegada, Taxa)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Uniforme titular (Azul). Chegar com 45min de antecedência para aquecimento."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Agendar Partida</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

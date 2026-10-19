import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrainingFocus } from '../../types';
import { X, Dumbbell } from 'lucide-react';

interface CreateTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTrainingModal: React.FC<CreateTrainingModalProps> = ({ isOpen, onClose }) => {
  const { createTraining, activeTeam } = useApp();

  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('19:30');
  const [local, setLocal] = useState('');
  const [foco, setFoco] = useState<TrainingFocus>('tatico');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !activeTeam) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Informe o título do treino.');
      return;
    }
    if (!data) {
      setError('Informe a data do treinamento.');
      return;
    }
    if (!local.trim()) {
      setError('Informe o local do treinamento.');
      return;
    }

    try {
      createTraining({
        titulo: titulo.trim(),
        data,
        horario,
        local: local.trim(),
        foco,
        descricao: descricao.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao agendar treino');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Novo Treinamento
            </h2>
            <p className="text-xs text-slate-500">Agendar treino para {activeTeam.nome}</p>
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
              Título / Assunto do Treino *
            </label>
            <input
              type="text"
              placeholder="Ex: Treino Tático e Bolas Paradas"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data *
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
              Local do Treino *
            </label>
            <input
              type="text"
              placeholder="Ex: Quadra 3 - Centro Esportivo Municipal"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Foco Principal
            </label>
            <select
              value={foco}
              onChange={(e) => setFoco(e.target.value as TrainingFocus)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="tatico">Tático (Posicionamento, Formações, Linhas)</option>
              <option value="tecnico">Técnico (Fundamentos, Passes, Finalizações)</option>
              <option value="fisico">Físico (Resistência, Velocidade, Recuperação)</option>
              <option value="coletivo">Coletivo Apronto (Jogo interno)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição / Materiais Necessários
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Levar coletes azul e vermelho. Trazer hidratação individual."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Agendar Treino</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

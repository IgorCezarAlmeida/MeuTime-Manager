import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SportId, ModalityId } from '../../types';
import { SPORTS_LIST, MODALITIES_CONFIG } from '../../constants/sports';
import { X, ShieldCheck } from 'lucide-react';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose }) => {
  const { createTeam } = useApp();

  const [nome, setNome] = useState('');
  const [esporte, setEsporte] = useState<SportId>('futebol');
  const [modalidade, setModalidade] = useState<ModalityId>('futebol_campo');
  const [cidade, setCidade] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0B2545');
  const [secondaryColor, setSecondaryColor] = useState('#134074');
  const [escudoUrl, setEscudoUrl] = useState('/src/assets/images/meutime_crest_logo_1791998120853.jpg');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Modalities available for selected sport
  const currentSport = SPORTS_LIST.find((s) => s.id === esporte);
  const availableModalities = currentSport ? currentSport.modalities : [];

  const handleSportChange = (newSport: SportId) => {
    setEsporte(newSport);
    const targetSport = SPORTS_LIST.find((s) => s.id === newSport);
    if (targetSport && targetSport.modalities.length > 0) {
      setModalidade(targetSport.modalities[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Informe o nome da equipe');
      return;
    }

    try {
      await createTeam({
        nome: nome.trim(),
        esporte,
        modalidade,
        escudoUrl,
        cidade: cidade.trim() || 'Brasil',
        fundacao: new Date().getFullYear().toString(),
        cores: {
          primary: primaryColor,
          secondary: secondaryColor,
          text: '#FFFFFF',
        },
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar equipe');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Criar Nova Equipe
            </h2>
            <p className="text-xs text-slate-500">Caso de Uso UC01 · Gestão de Equipe</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Equipe *
            </label>
            <input
              type="text"
              placeholder="Ex: Real Amador FC, Panteras 3x3..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Sport selection */}
          <div className="grid grid-cols-3 gap-2">
            {SPORTS_LIST.map((sport) => {
              const isSelected = esporte === sport.id;
              return (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => handleSportChange(sport.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {sport.name}
                </button>
              );
            })}
          </div>

          {/* Modality selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Modalidade *
            </label>
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value as ModalityId)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
            >
              {availableModalities.map((modKey) => {
                const conf = MODALITIES_CONFIG[modKey];
                return (
                  <option key={modKey} value={modKey}>
                    {conf.name} ({conf.maxStarters} atletas titulares)
                  </option>
                );
              })}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              A modalidade definirá o tipo de quadra/campo, formações e regras de escalação.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cidade / Bairro
            </label>
            <input
              type="text"
              placeholder="Ex: São Paulo, SP"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cor Primária
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {primaryColor}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cor Secundária
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {secondaryColor}
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirmar Criação da Equipe</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MODALITIES_CONFIG } from '../../constants/sports';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  Bookmark,
  Shield,
  Zap,
  Target,
} from 'lucide-react';

export const TacticsScreen: React.FC = () => {
  const { activeTeam, tactics, saveTactic, currentUser } = useApp();
  const config = activeTeam ? MODALITIES_CONFIG[activeTeam.modalidade] : null;

  const isCoach = currentUser.role === 'tecnico';

  const [titulo, setTitulo] = useState('');
  const [formacao, setFormacao] = useState(config?.formations[0]?.name || '4-3-3');
  const [mentalidade, setMentalidade] = useState<'Defensiva' | 'Equilibrada' | 'Ofensiva'>('Ofensiva');
  const [pressao, setPressao] = useState<'Baixa' | 'Média' | 'Alta'>('Alta');
  const [instrucoes, setInstrucoes] = useState<string[]>([
    'Saída sustentada com apoio dos laterais/alas.',
    'Pressão imediata após a perda da posse de bola.',
    'Movimentação em diagonal dos homens de frente.',
  ]);
  const [novaInstrucao, setNovaInstrucao] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!activeTeam || !config) return null;

  // Filter tactics for current team & modality (RN13)
  const teamTactics = tactics.filter(
    (t) => t.timeId === activeTeam.id && t.modalidade === activeTeam.modalidade
  );

  const handleAddInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaInstrucao.trim()) return;
    setInstrucoes((prev) => [...prev, novaInstrucao.trim()]);
    setNovaInstrucao('');
  };

  const handleRemoveInstruction = (idx: number) => {
    setInstrucoes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveTactic = () => {
    if (!titulo.trim()) return;
    saveTactic({
      modalidade: activeTeam.modalidade,
      titulo: titulo.trim(),
      formacao,
      mentalidade,
      pressao,
      instrucoes,
    });
    setSavedNotice(true);
    setTitulo('');
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleLoadTactic = (tac: typeof teamTactics[0]) => {
    setTitulo(tac.titulo);
    setFormacao(tac.formacao);
    setMentalidade(tac.mentalidade);
    setPressao(tac.pressao);
    setInstrucoes(tac.instrucoes);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Prancheta & Estratégias Táticas
        </h2>
        <p className="text-xs text-slate-500">
          Requisito RF15 / Regra RN13 · Compatível com {config.name}
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Estratégia tática salva no plano da equipe!</span>
        </div>
      )}

      {/* Tactic Editor Card */}
      <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nome da Estratégia / Plano de Jogo
          </label>
          <input
            type="text"
            disabled={!isCoach}
            placeholder="Ex: Pressão Alta contra Linha Baixa..."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Formação Base
            </label>
            <select
              disabled={!isCoach}
              value={formacao}
              onChange={(e) => setFormacao(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold cursor-pointer"
            >
              {config.formations.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Mentalidade</span>
            </label>
            <select
              disabled={!isCoach}
              value={mentalidade}
              onChange={(e) => setMentalidade(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="Defensiva">Defensiva / Reativa</option>
              <option value="Equilibrada">Equilibrada / Bloco Médio</option>
              <option value="Ofensiva">Ofensiva / Propositiva</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Pressão sem Bola</span>
            </label>
            <select
              disabled={!isCoach}
              value={pressao}
              onChange={(e) => setPressao(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="Baixa">Baixa (Esperar no campo de defesa)</option>
              <option value="Média">Média (Gatilho na intermediária)</option>
              <option value="Alta">Alta (Sufocar saída do adversário)</option>
            </select>
          </div>
        </div>

        {/* Tactical Guidelines List */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Instruções Táticas para os Atletas
          </label>

          <div className="space-y-1.5 mb-2.5">
            {instrucoes.map((ins, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">{ins}</span>
                </div>

                {isCoach && (
                  <button
                    onClick={() => handleRemoveInstruction(idx)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isCoach && (
            <form onSubmit={handleAddInstruction} className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar nova instrução (ex: 'Cobrador oficial de faltas: Gabi #10')..."
                value={novaInstrucao}
                onChange={(e) => setNovaInstrucao(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
              >
                + Inserir
              </button>
            </form>
          )}
        </div>

        {isCoach && (
          <div className="pt-2">
            <button
              onClick={handleSaveTactic}
              disabled={!titulo.trim()}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              <span>Salvar Estratégia no Caderno Tático</span>
            </button>
          </div>
        )}
      </div>

      {/* Saved Tactics Library */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Táticas Salvas da Equipe ({teamTactics.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teamTactics.map((tac) => (
            <div
              key={tac.id}
              className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {tac.titulo}
                </span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                  {tac.formacao}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>{tac.mentalidade}</span>
                <span aria-hidden="true">·</span>
                <span>Pressão {tac.pressao}</span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                {tac.instrucoes.join(' ')}
              </p>

              <button
                onClick={() => handleLoadTactic(tac)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer block pt-1"
              >
                Carregar na Prancheta →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

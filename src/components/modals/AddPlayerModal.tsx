import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Player, DominantSide, PlayerStatus } from '../../types';
import { MODALITIES_CONFIG } from '../../constants/sports';
import { X, UserPlus, Save } from 'lucide-react';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerToEdit?: Player | null;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  isOpen,
  onClose,
  playerToEdit,
}) => {
  const { activeTeam, addPlayer, updatePlayer } = useApp();

  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [numero, setNumero] = useState<number | ''>('');
  const [posicao, setPosicao] = useState('');
  const [posicaoSecundaria, setPosicaoSecundaria] = useState('');
  const [peDominante, setPeDominante] = useState<DominantSide>('Destro');
  const [status, setStatus] = useState<PlayerStatus>('ativo');
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const config = activeTeam ? MODALITIES_CONFIG[activeTeam.modalidade] : null;

  useEffect(() => {
    if (playerToEdit) {
      setNome(playerToEdit.nome);
      setApelido(playerToEdit.apelido || '');
      setNumero(playerToEdit.numero);
      setPosicao(playerToEdit.posicao);
      setPosicaoSecundaria(playerToEdit.posicaoSecundaria || '');
      setPeDominante(playerToEdit.peDominante || 'Destro');
      setStatus(playerToEdit.status);
      setTelefone(playerToEdit.telefone || '');
    } else {
      setNome('');
      setApelido('');
      setNumero('');
      setPosicao(config?.positions[0]?.shortName || '');
      setPosicaoSecundaria('');
      setPeDominante('Destro');
      setStatus('ativo');
      setTelefone('');
    }
    setError(null);
  }, [playerToEdit, isOpen, config]);

  if (!isOpen || !activeTeam || !config) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setError('Informe o nome do atleta.');
      return;
    }
    if (numero === '' || isNaN(Number(numero)) || Number(numero) < 0 || Number(numero) > 99) {
      setError('Informe um número válido para a camisa (0 a 99).');
      return;
    }
    if (!posicao) {
      setError('Selecione a posição principal do jogador.');
      return;
    }

    try {
      if (playerToEdit) {
        updatePlayer({
          ...playerToEdit,
          nome: nome.trim(),
          apelido: apelido.trim() || undefined,
          numero: Number(numero),
          posicao,
          posicaoSecundaria: posicaoSecundaria || undefined,
          peDominante,
          status,
          telefone: telefone.trim() || undefined,
        });
      } else {
        addPlayer({
          nome: nome.trim(),
          apelido: apelido.trim() || undefined,
          numero: Number(numero),
          posicao,
          posicaoSecundaria: posicaoSecundaria || undefined,
          peDominante,
          status,
          telefone: telefone.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar atleta');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {playerToEdit ? 'Editar Atleta' : 'Novo Jogador'}
            </h2>
            <p className="text-xs text-slate-500">
              {activeTeam.nome} · {config.name}
            </p>
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
              Nome Completo *
            </label>
            <input
              type="text"
              placeholder="Ex: Gabriel da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Apelido no Time
              </label>
              <input
                type="text"
                placeholder="Ex: Gabi 10"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nº Camisa *
              </label>
              <input
                type="number"
                min="0"
                max="99"
                placeholder="Ex: 10"
                value={numero}
                onChange={(e) => setNumero(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Posição Principal *
              </label>
              <select
                value={posicao}
                onChange={(e) => setPosicao(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                required
              >
                {config.positions.map((p) => (
                  <option key={p.id} value={p.shortName}>
                    {p.name} ({p.shortName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Posição Secundária
              </label>
              <select
                value={posicaoSecundaria}
                onChange={(e) => setPosicaoSecundaria(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">Nenhuma</option>
                {config.positions.map((p) => (
                  <option key={`sec-${p.id}`} value={p.shortName}>
                    {p.name} ({p.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lado Dominante
              </label>
              <select
                value={peDominante}
                onChange={(e) => setPeDominante(e.target.value as DominantSide)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Destro">Destro</option>
                <option value="Canhoto">Canhoto</option>
                <option value="Ambidestro">Ambidestro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status no Elenco
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlayerStatus)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="ativo">Disponível / Ativo</option>
                <option value="lesionado">Departamento Médico</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp / Contato
            </label>
            <input
              type="text"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-medium text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {playerToEdit ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{playerToEdit ? 'Salvar Alterações' : 'Cadastrar no Elenco'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

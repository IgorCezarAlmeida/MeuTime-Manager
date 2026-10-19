import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MODALITIES_CONFIG } from '../../constants/sports';
import {
  User,
  Shield,
  Trophy,
  Calendar,
  CheckCircle,
  Copy,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface ProfileScreenProps {
  onOpenCreateTeam: () => void;
  onOpenJoinTeam: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenCreateTeam,
  onOpenJoinTeam,
}) => {
  const {
    currentUser,
    activeTeam,
    players,
    matches,
    resetToInitialData,
    teams,
    setActiveTeamId,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const config = activeTeam ? MODALITIES_CONFIG[activeTeam.modalidade] : null;

  const teamPlayers = players.filter((p) => p.timeId === activeTeam?.id);
  const currentLinkedPlayer = currentUser.jogadorVinculadoId
    ? teamPlayers.find((p) => p.id === currentUser.jogadorVinculadoId)
    : teamPlayers.find((p) => p.usuarioUid === currentUser.uid);

  const handleCopyCode = () => {
    if (activeTeam) {
      navigator.clipboard.writeText(activeTeam.codigoConvite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* User Header Profile */}
      <div className="p-5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
          {currentUser.nome.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {currentUser.nome}
            </h2>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                currentUser.role === 'tecnico'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
              }`}
            >
              {currentUser.role === 'tecnico' ? 'Técnico / Gestor' : 'Atleta Oficial'}
            </span>
          </div>

          <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>

          {activeTeam && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1 truncate">
              {activeTeam.nome} ({config?.name})
            </p>
          )}
        </div>
      </div>

      {/* Individual Athlete Stats (RF22) */}
      {currentLinkedPlayer && (
        <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Minhas Estatísticas Individuais (RF22)</span>
            </h3>
            <span className="font-athletic font-bold text-xs text-slate-500">
              Camisa #{currentLinkedPlayer.numero} · {currentLinkedPlayer.posicao}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-lg font-bold font-athletic text-slate-900 dark:text-white tabular-nums">
                {currentLinkedPlayer.estatisticas.jogos}
              </span>
              <span className="text-[10px] text-slate-500 block">Partidas</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-lg font-bold font-athletic text-emerald-600 dark:text-emerald-400 tabular-nums">
                {currentLinkedPlayer.estatisticas.gols}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {activeTeam?.esporte === 'basquete' ? 'Pontos' : 'Gols'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-lg font-bold font-athletic text-blue-600 dark:text-blue-400 tabular-nums">
                {currentLinkedPlayer.estatisticas.assistencias}
              </span>
              <span className="text-[10px] text-slate-500 block">Assistências</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-lg font-bold font-athletic text-purple-600 dark:text-purple-400 tabular-nums">
                {currentLinkedPlayer.estatisticas.presencaPct}%
              </span>
              <span className="text-[10px] text-slate-500 block">Presença</span>
            </div>
          </div>
        </div>
      )}

      {/* Team Details & Invite Hub */}
      {activeTeam && (
        <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Dados da Equipe
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500">Nome:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{activeTeam.nome}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500">Modalidade:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{config?.name}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500">Técnico Responsável:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{activeTeam.tecnicoNome}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Código de Convite:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-500">{activeTeam.codigoConvite}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions and Utilities */}
      <div className="space-y-2">
        <button
          onClick={onOpenJoinTeam}
          className="w-full p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-white hover:border-blue-500 cursor-pointer shadow-2xs"
        >
          <span>Entrar em Outra Equipe com Código de Convite</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {currentUser.role === 'tecnico' && (
          <button
            onClick={onOpenCreateTeam}
            className="w-full p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-white hover:border-emerald-500 cursor-pointer shadow-2xs"
          >
            <span>Criar Nova Equipe Esportiva (UC01)</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}

        <button
          onClick={resetToInitialData}
          className="w-full p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Banco de Dados de Demonstração</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Document reference footer note */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Documento de Engenharia de Software MeuTime Manager
        </p>
        <p>
          Arquitetura modular extensível suportando Futebol de Campo, Futebol 7, Futsal, Basquete 3x3 e 5x5, com controle de presença, escalações e estratégias.
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Match, Training } from '../../types';
import { ScreenTab } from '../common/BottomTabBar';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Dumbbell,
  Plus,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

interface CalendarScreenProps {
  onOpenCreateMatch: () => void;
  onOpenCreateTraining: () => void;
  onOpenResultModal: (match: Match) => void;
  onNavigate: (tab: ScreenTab) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  onOpenCreateMatch,
  onOpenCreateTraining,
  onOpenResultModal,
  onNavigate,
}) => {
  const {
    activeTeam,
    matches,
    trainings,
    currentUser,
    players,
    attendances,
    setAttendance,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'todos' | 'partidas' | 'treinos' | 'passados'>('todos');

  if (!activeTeam) return null;

  const isCoach = currentUser.role === 'tecnico';
  const teamMatches = matches.filter((m) => m.timeId === activeTeam.id);
  const teamTrainings = trainings.filter((t) => t.timeId === activeTeam.id);
  const teamPlayers = players.filter((p) => p.timeId === activeTeam.id);

  // Player link
  const currentLinkedPlayer = currentUser.jogadorVinculadoId
    ? teamPlayers.find((p) => p.id === currentUser.jogadorVinculadoId)
    : teamPlayers.find((p) => p.usuarioUid === currentUser.uid);

  // Combine items
  type CalendarItem =
    | { type: 'match'; data: Match; sortDate: string }
    | { type: 'training'; data: Training; sortDate: string };

  const allItems: CalendarItem[] = [
    ...teamMatches.map((m) => ({
      type: 'match' as const,
      data: m,
      sortDate: `${m.data}T${m.horario}`,
    })),
    ...teamTrainings.map((t) => ({
      type: 'training' as const,
      data: t,
      sortDate: `${t.data}T${t.horario}`,
    })),
  ];

  // Sorting
  allItems.sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());

  // Filtering
  const filteredItems = allItems.filter((item) => {
    if (activeFilter === 'partidas') return item.type === 'match';
    if (activeFilter === 'treinos') return item.type === 'training';
    if (activeFilter === 'passados') {
      return item.type === 'match' && item.data.status === 'finalizada';
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Calendário & Agenda
          </h2>
          <p className="text-xs text-slate-500">
            {teamMatches.length} partidas · {teamTrainings.length} treinamentos
          </p>
        </div>

        {isCoach && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCreateMatch}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Partida</span>
            </button>
            <button
              onClick={onOpenCreateTraining}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Novo Treino</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveFilter('todos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
            activeFilter === 'todos'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Todos ({allItems.length})
        </button>
        <button
          onClick={() => setActiveFilter('partidas')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
            activeFilter === 'partidas'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Partidas ({teamMatches.length})
        </button>
        <button
          onClick={() => setActiveFilter('treinos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
            activeFilter === 'treinos'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Treinos ({teamTrainings.length})
        </button>
        <button
          onClick={() => setActiveFilter('passados')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
            activeFilter === 'passados'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Resultados Salvos
        </button>
      </div>

      {/* Events Stream */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <p className="text-xs text-slate-500">Nenhum evento para este filtro.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            if (item.type === 'match') {
              const match = item.data;
              const isFinished = match.status === 'finalizada';
              const matchAttendances = attendances.filter(
                (a) => a.eventoId === match.id && a.eventoTipo === 'partida'
              );
              const confirmedCount = matchAttendances.filter((a) => a.status === 'confirmado').length;

              const myAttendance = currentLinkedPlayer
                ? matchAttendances.find((a) => a.jogadorId === currentLinkedPlayer.id)
                : null;

              return (
                <div
                  key={`match-${match.id}-${idx}`}
                  className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>PARTIDA · {match.tipo.toUpperCase()}</span>
                    </span>

                    {isFinished ? (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        Finalizada
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        {confirmedCount} atletas confirmados
                      </span>
                    )}
                  </div>

                  {/* Match Teams / Scoreboard */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1 font-bold text-sm text-slate-900 dark:text-white truncate">
                      {activeTeam.nome}
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/80 font-athletic text-base font-bold text-slate-800 dark:text-slate-100 min-w-[60px] text-center">
                      {isFinished && match.resultado ? (
                        <span className="tabular-nums">
                          {match.resultado.placarTime} × {match.resultado.placarAdversario}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-sans">VS</span>
                      )}
                    </div>

                    <div className="flex-1 text-right font-bold text-sm text-slate-900 dark:text-white truncate">
                      {match.adversario}
                    </div>
                  </div>

                  {/* Date, Time & Venue */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {match.data} às {match.horario}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{match.local}</span>
                    </div>
                  </div>

                  {/* Goal scorers if finished */}
                  {isFinished && match.resultado?.golsMarcados && match.resultado.golsMarcados.length > 0 && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold block mb-0.5 text-slate-700 dark:text-slate-200">
                        {activeTeam.esporte === 'basquete' ? 'Pontuadores:' : 'Gols da Partida:'}
                      </span>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {match.resultado.golsMarcados.map((g, i) => (
                          <span key={i} className="text-slate-500 dark:text-slate-400">
                            ⚽ {g.jogadorNome} {g.minuto ? `(${g.minuto})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Actions based on role */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                    {/* Athlete Quick RSVP */}
                    {currentUser.role === 'jogador' && !isFinished && currentLinkedPlayer ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Presença:</span>
                        <button
                          onClick={() =>
                            setAttendance('partida', match.id, currentLinkedPlayer.id, 'confirmado')
                          }
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                            myAttendance?.status === 'confirmado'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Vou</span>
                        </button>
                        <button
                          onClick={() =>
                            setAttendance('partida', match.id, currentLinkedPlayer.id, 'recusado')
                          }
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                            myAttendance?.status === 'recusado'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Não vou</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onNavigate('attendance')}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>Ver Lista de Presença</span>
                      </button>
                    )}

                    {/* Coach Score & Lineup Actions */}
                    {isCoach && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenResultModal(match)}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                        >
                          {isFinished ? 'Editar Súmula' : 'Lançar Placar'}
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          onClick={() => onNavigate('lineup')}
                          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                        >
                          Escalação
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              // Training Item
              const training = item.data;
              const trainingAttendances = attendances.filter(
                (a) => a.eventoId === training.id && a.eventoTipo === 'treino'
              );
              const confirmedCount = trainingAttendances.filter((a) => a.status === 'confirmado').length;
              const myAttendance = currentLinkedPlayer
                ? trainingAttendances.find((a) => a.jogadorId === currentLinkedPlayer.id)
                : null;

              return (
                <div
                  key={`training-${training.id}-${idx}`}
                  className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>TREINAMENTO · {training.foco.toUpperCase()}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {confirmedCount} presenças confirmadas
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {training.titulo}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {training.data} às {training.horario}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{training.local}</span>
                    </div>
                  </div>

                  {training.descricao && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {training.descricao}
                    </p>
                  )}

                  {/* Athlete RSVP for training */}
                  {currentUser.role === 'jogador' && currentLinkedPlayer && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Confirmar presença no treino:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setAttendance('treino', training.id, currentLinkedPlayer.id, 'confirmado')
                          }
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                            myAttendance?.status === 'confirmado'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Vou</span>
                        </button>
                        <button
                          onClick={() =>
                            setAttendance('treino', training.id, currentLinkedPlayer.id, 'recusado')
                          }
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                            myAttendance?.status === 'recusado'
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Não vou</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};

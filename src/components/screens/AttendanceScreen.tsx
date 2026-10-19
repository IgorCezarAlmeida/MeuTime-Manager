import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Share2,
  Phone,
  MessageSquare,
} from 'lucide-react';

export const AttendanceScreen: React.FC = () => {
  const {
    activeTeam,
    matches,
    trainings,
    players,
    attendances,
    setAttendance,
    currentUser,
  } = useApp();

  const isCoach = currentUser.role === 'tecnico';
  const teamPlayers = players.filter((p) => p.timeId === activeTeam?.id && p.status === 'ativo');

  // Selectable upcoming events
  const upcomingMatches = matches
    .filter((m) => m.timeId === activeTeam?.id && m.status === 'agendada')
    .map((m) => ({
      id: m.id,
      tipo: 'partida' as const,
      title: `Jogo vs ${m.adversario}`,
      subtitle: `${m.data} às ${m.horario} · ${m.local}`,
    }));

  const upcomingTrainings = trainings
    .filter((t) => t.timeId === activeTeam?.id)
    .map((t) => ({
      id: t.id,
      tipo: 'treino' as const,
      title: `Treino: ${t.titulo}`,
      subtitle: `${t.data} às ${t.horario} · ${t.local}`,
    }));

  const allEvents = [...upcomingMatches, ...upcomingTrainings];

  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'confirmado' | 'recusado' | 'pendente'>('todos');
  const [justificativaInput, setJustificativaInput] = useState('');

  if (!activeTeam || allEvents.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <ClipboardCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Nenhum evento agendado para controle de presença
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Agende uma partida ou treinamento no calendário primeiro.
        </p>
      </div>
    );
  }

  const activeEvent = allEvents[selectedEventIndex] || allEvents[0];

  // Attendances for this event
  const eventAttendances = attendances.filter(
    (a) => a.eventoId === activeEvent.id && a.eventoTipo === activeEvent.tipo
  );
  const attendanceMap = Object.fromEntries(
    eventAttendances.map((a) => [a.jogadorId, a])
  );

  // Stats
  const confirmed = teamPlayers.filter((p) => attendanceMap[p.id]?.status === 'confirmado');
  const declined = teamPlayers.filter((p) => attendanceMap[p.id]?.status === 'recusado');
  const doubt = teamPlayers.filter((p) => attendanceMap[p.id]?.status === 'duvida');
  const pending = teamPlayers.filter((p) => !attendanceMap[p.id]);

  const currentLinkedPlayer = currentUser.jogadorVinculadoId
    ? teamPlayers.find((p) => p.id === currentUser.jogadorVinculadoId)
    : teamPlayers.find((p) => p.usuarioUid === currentUser.uid);

  const myStatus = currentLinkedPlayer ? attendanceMap[currentLinkedPlayer.id] : null;

  const handleSetMyAttendance = (status: AttendanceStatus) => {
    if (!currentLinkedPlayer) return;
    setAttendance(
      activeEvent.tipo,
      activeEvent.id,
      currentLinkedPlayer.id,
      status,
      justificativaInput.trim() || undefined
    );
  };

  const handleCoachSetPlayerAttendance = (playerId: string, status: AttendanceStatus) => {
    if (!isCoach) return;
    setAttendance(activeEvent.tipo, activeEvent.id, playerId, status);
  };

  // Filtered players list
  const displayedPlayers = teamPlayers.filter((p) => {
    const status = attendanceMap[p.id]?.status;
    if (filterStatus === 'confirmado') return status === 'confirmado';
    if (filterStatus === 'recusado') return status === 'recusado';
    if (filterStatus === 'pendente') return !status || status === 'duvida';
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Controle de Presença & Quórum
        </h2>
        <p className="text-xs text-slate-500">
          Caso de Uso UC05 · Confirmação e Disponibilidade dos Atletas
        </p>
      </div>

      {/* Event Selector Horizontal Carousel */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
          Selecione o Evento:
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allEvents.map((evt, idx) => {
            const isSelected = selectedEventIndex === idx;
            return (
              <button
                key={evt.id}
                onClick={() => setSelectedEventIndex(idx)}
                className={`p-3 rounded-2xl border text-left min-w-[220px] max-w-[260px] shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">
                  <Calendar className="w-3 h-3" />
                  <span>{evt.tipo}</span>
                </div>
                <h4 className="text-xs font-bold truncate leading-tight">{evt.title}</h4>
                <p className={`text-[11px] truncate mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {evt.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quorum Progress Strip */}
      <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Quórum Atual: {confirmed.length} / {teamPlayers.length} atletas
          </span>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {teamPlayers.length > 0
              ? `${Math.round((confirmed.length / teamPlayers.length) * 100)}%`
              : '0%'}
          </span>
        </div>

        {/* Multi-segmented bar */}
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(confirmed.length / (teamPlayers.length || 1)) * 100}%` }}
            className="bg-emerald-500 transition-all"
            title="Confirmados"
          />
          <div
            style={{ width: `${(doubt.length / (teamPlayers.length || 1)) * 100}%` }}
            className="bg-amber-400 transition-all"
            title="Dúvidas"
          />
          <div
            style={{ width: `${(declined.length / (teamPlayers.length || 1)) * 100}%` }}
            className="bg-red-500 transition-all"
            title="Recusados"
          />
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="text-sm font-bold block tabular-nums">{confirmed.length}</span>
            <span className="text-[10px]">Confirmados</span>
          </div>
          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/60">
            <span className="text-sm font-bold block tabular-nums">{declined.length}</span>
            <span className="text-[10px]">Ausentes</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            <span className="text-sm font-bold block tabular-nums">{doubt.length}</span>
            <span className="text-[10px]">Dúvidas</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="text-sm font-bold block tabular-nums">{pending.length}</span>
            <span className="text-[10px]">Sem resposta</span>
          </div>
        </div>
      </div>

      {/* Athlete Response Box (If Player role) */}
      {currentUser.role === 'jogador' && currentLinkedPlayer && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950 dark:text-blue-200">
              Minha Resposta: #{currentLinkedPlayer.numero} - {currentLinkedPlayer.nome}
            </h3>
            {myStatus && (
              <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                Registrado em {myStatus.atualizadoEm}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSetMyAttendance('confirmado')}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                myStatus?.status === 'confirmado'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Confirmar (Vou)</span>
            </button>
            <button
              onClick={() => handleSetMyAttendance('recusado')}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                myStatus?.status === 'recusado'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Não poderei ir</span>
            </button>
            <button
              onClick={() => handleSetMyAttendance('duvida')}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                myStatus?.status === 'duvida'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Dúvida</span>
            </button>
          </div>

          <input
            type="text"
            placeholder="Observação ou motivo (opcional: 'Chego às 09h40', 'Plantão no trabalho')..."
            value={justificativaInput}
            onChange={(e) => setJustificativaInput(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* Filter and Players Availability List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Lista de Disponibilidade ({displayedPlayers.length})
          </h3>

          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                filterStatus === 'todos'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('confirmado')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                filterStatus === 'confirmado'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              Confirmados
            </button>
            <button
              onClick={() => setFilterStatus('recusado')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                filterStatus === 'recusado'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-500 hover:text-red-600'
              }`}
            >
              Ausentes
            </button>
            <button
              onClick={() => setFilterStatus('pendente')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium cursor-pointer ${
                filterStatus === 'pendente'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-500 hover:text-amber-600'
              }`}
            >
              Pendentes
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-2">
          {displayedPlayers.map((player) => {
            const att = attendanceMap[player.id];
            const status = att?.status;

            return (
              <div
                key={player.id}
                className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-athletic font-bold flex items-center justify-center shrink-0">
                    {player.numero}
                  </span>

                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {player.nome}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{player.posicao}</span>
                      {att?.justificativa && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-400 italic truncate max-w-[180px]">
                            "{att.justificativa}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status indicator & Coach override buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isCoach ? (
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600">
                      <button
                        title="Confirmar presença"
                        onClick={() => handleCoachSetPlayerAttendance(player.id, 'confirmado')}
                        className={`p-1 rounded cursor-pointer ${
                          status === 'confirmado'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-emerald-500'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Registrar dúvida"
                        onClick={() => handleCoachSetPlayerAttendance(player.id, 'duvida')}
                        className={`p-1 rounded cursor-pointer ${
                          status === 'duvida'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-amber-500'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Registrar ausência"
                        onClick={() => handleCoachSetPlayerAttendance(player.id, 'recusado')}
                        className={`p-1 rounded cursor-pointer ${
                          status === 'recusado'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-red-500'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      {status === 'confirmado' && (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmado</span>
                        </span>
                      )}
                      {status === 'recusado' && (
                        <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Ausente</span>
                        </span>
                      )}
                      {status === 'duvida' && (
                        <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Dúvida</span>
                        </span>
                      )}
                      {!status && (
                        <span className="text-[11px] text-slate-400 italic">Pendente</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

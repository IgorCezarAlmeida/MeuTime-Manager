import React from 'react';
import { useApp } from '../../context/AppContext';
import { MODALITIES_CONFIG } from '../../constants/sports';
import { ScreenTab } from '../common/BottomTabBar';
import {
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (tab: ScreenTab) => void;
  onOpenCreateMatch: () => void;
  onOpenAddPlayer: () => void;
  onOpenJoinTeam: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  onOpenCreateMatch,
  onOpenAddPlayer,
  onOpenJoinTeam,
}) => {
  const { activeTeam, matches, trainings, players, currentUser, attendances, setAttendance } = useApp();
  const [copiedCode, setCopiedCode] = React.useState(false);

  if (!activeTeam) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">
          Nenhuma equipe encontrada
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Crie seu primeiro time ou entre em um usando o código de convite.
        </p>
      </div>
    );
  }

  const config = MODALITIES_CONFIG[activeTeam.modalidade];
  const teamPlayers = players.filter((p) => p.timeId === activeTeam.id);
  const teamMatches = matches.filter((m) => m.timeId === activeTeam.id);
  const teamTrainings = trainings.filter((t) => t.timeId === activeTeam.id);

  // Next scheduled match
  const upcomingMatches = teamMatches
    .filter((m) => m.status === 'agendada')
    .sort((a, b) => new Date(`${a.data}T${a.horario}`).getTime() - new Date(`${b.data}T${b.horario}`).getTime());
  const nextMatch = upcomingMatches[0] || null;

  // Next training
  const upcomingTrainings = teamTrainings.sort(
    (a, b) => new Date(`${a.data}T${a.horario}`).getTime() - new Date(`${b.data}T${b.horario}`).getTime()
  );
  const nextTraining = upcomingTrainings[0] || null;

  // Stats calculation
  const finishedMatches = teamMatches.filter((m) => m.status === 'finalizada' && m.resultado);
  const wins = finishedMatches.filter((m) => (m.resultado?.placarTime ?? 0) > (m.resultado?.placarAdversario ?? 0)).length;
  const draws = finishedMatches.filter((m) => (m.resultado?.placarTime ?? 0) === (m.resultado?.placarAdversario ?? 0)).length;
  const losses = finishedMatches.filter((m) => (m.resultado?.placarTime ?? 0) < (m.resultado?.placarAdversario ?? 0)).length;
  const goalsFor = finishedMatches.reduce((acc, m) => acc + (m.resultado?.placarTime ?? 0), 0);
  const goalsAgainst = finishedMatches.reduce((acc, m) => acc + (m.resultado?.placarAdversario ?? 0), 0);

  // Next match attendance breakdown
  const nextMatchAttendances = nextMatch
    ? attendances.filter((a) => a.eventoId === nextMatch.id && a.eventoTipo === 'partida')
    : [];
  const confirmedCount = nextMatchAttendances.filter((a) => a.status === 'confirmado').length;
  const declinedCount = nextMatchAttendances.filter((a) => a.status === 'recusado').length;
  const doubtCount = nextMatchAttendances.filter((a) => a.status === 'duvida').length;

  // If current user is a linked player, find their status for the next match
  const currentLinkedPlayer = currentUser.jogadorVinculadoId
    ? teamPlayers.find((p) => p.id === currentUser.jogadorVinculadoId)
    : teamPlayers.find((p) => p.usuarioUid === currentUser.uid);

  const myAttendance = nextMatch && currentLinkedPlayer
    ? attendances.find(
        (a) =>
          a.eventoId === nextMatch.id &&
          a.jogadorId === currentLinkedPlayer.id &&
          a.eventoTipo === 'partida'
      )
    : null;

  const copyInviteCode = () => {
    navigator.clipboard.writeText(activeTeam.codigoConvite);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Team Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-4 sm:p-5 text-white shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-400/80 shadow-md shrink-0 flex items-center justify-center">
            {activeTeam.escudoUrl ? (
              <img
                src={activeTeam.escudoUrl}
                alt={activeTeam.nome}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Trophy className="w-7 h-7 text-amber-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate">
              {activeTeam.nome}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
              <span>{config.name}</span>
              <span aria-hidden="true">·</span>
              <span>{activeTeam.cidade}</span>
            </div>
          </div>
        </div>

        {/* Invite Code Strip */}
        <div className="mt-3.5 pt-3 border-t border-slate-700/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-[11px] text-slate-400">Convite:</span>
            <span className="font-mono font-bold text-amber-300 tracking-wider">
              {activeTeam.codigoConvite}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyInviteCode}
              className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer transition-colors"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={onOpenJoinTeam}
              className="text-[11px] text-blue-300 hover:text-blue-200 cursor-pointer underline"
            >
              Vincular Conta
            </button>
          </div>
        </div>
      </div>

      {/* Quick Athlete Attendance Banner (If logged in as player) */}
      {currentUser.role === 'jogador' && nextMatch && currentLinkedPlayer && (
        <div className="rounded-2xl p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                Sua Presença no Próximo Jogo
              </h3>
            </div>
            {myAttendance ? (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  myAttendance.status === 'confirmado'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                    : myAttendance.status === 'recusado'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                }`}
              >
                {myAttendance.status === 'confirmado' ? 'Confirmado' : myAttendance.status === 'recusado' ? 'Não vou' : 'Dúvida'}
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Pendente de resposta
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            {nextMatch.adversario} · {nextMatch.data} às {nextMatch.horario}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                setAttendance('partida', nextMatch.id, currentLinkedPlayer.id, 'confirmado')
              }
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                myAttendance?.status === 'confirmado'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Vou Jogar</span>
            </button>
            <button
              onClick={() =>
                setAttendance('partida', nextMatch.id, currentLinkedPlayer.id, 'recusado')
              }
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                myAttendance?.status === 'recusado'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/30'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Não vou</span>
            </button>
            <button
              onClick={() =>
                setAttendance('partida', nextMatch.id, currentLinkedPlayer.id, 'duvida')
              }
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                myAttendance?.status === 'duvida'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Dúvida</span>
            </button>
          </div>
        </div>
      )}

      {/* Next Match Highlight Card */}
      {nextMatch ? (
        <div className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Próximo Confronto
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {nextMatch.tipo.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-y border-slate-100 dark:border-slate-700/60">
            <div className="flex-1 text-center font-bold text-sm text-slate-900 dark:text-white truncate">
              {activeTeam.nome}
            </div>
            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700/60 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
              VS
            </div>
            <div className="flex-1 text-center font-bold text-sm text-slate-900 dark:text-white truncate">
              {nextMatch.adversario}
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {nextMatch.data} às {nextMatch.horario}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{nextMatch.local}</span>
            </div>
          </div>

          {/* Attendance Bar */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Quórum:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                {confirmedCount} confirmados
              </span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-red-500 dark:text-red-400 font-medium tabular-nums">
                {declinedCount} ausentes
              </span>
            </div>

            <button
              onClick={() => onNavigate('lineup')}
              className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Ver Escalação</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-4 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-center">
          <p className="text-xs text-slate-500 mb-2">Nenhuma partida agendada.</p>
          {currentUser.role === 'tecnico' && (
            <button
              onClick={onOpenCreateMatch}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              + Agendar Primeiro Jogo
            </button>
          )}
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Elenco Ativo</span>
          <span className="text-xl font-bold font-athletic text-slate-900 dark:text-white tabular-nums">
            {teamPlayers.length}
          </span>
          <span className="text-[10px] text-slate-400 block">atletas</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Campanha</span>
          <span className="text-xl font-bold font-athletic text-slate-900 dark:text-white tabular-nums">
            {wins}V · {draws}E · {losses}D
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
            {finishedMatches.length > 0 ? `${Math.round((wins / finishedMatches.length) * 100)}% aproveit.` : 'Sem jogos'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Gols/Cestas</span>
          <span className="text-xl font-bold font-athletic text-slate-900 dark:text-white tabular-nums">
            {goalsFor} : {goalsAgainst}
          </span>
          <span className="text-[10px] text-slate-400 block">
            Saldo: {goalsFor - goalsAgainst >= 0 ? `+${goalsFor - goalsAgainst}` : goalsFor - goalsAgainst}
          </span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Gestão Rápida
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onNavigate('lineup')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 text-left hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Escalação & Campo
              </span>
              <span className="text-[11px] text-slate-500">Formações & titulares</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('roster')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 text-left hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Gerenciar Elenco
              </span>
              <span className="text-[11px] text-slate-500">{teamPlayers.length} cadastrados</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 text-left hover:border-amber-400 dark:hover:border-amber-500 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Calendário Completo
              </span>
              <span className="text-[11px] text-slate-500">Partidas e treinos</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('tactics')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 text-left hover:border-purple-400 dark:hover:border-purple-500 transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Prancheta Tática
              </span>
              <span className="text-[11px] text-slate-500">Estratégias e plano</span>
            </div>
          </button>
        </div>
      </div>

      {/* Next Training Card */}
      {nextTraining && (
        <div className="rounded-2xl p-4 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>⚡ Próximo Treino</span>
            </span>
            <span className="text-xs text-slate-500 capitalize">{nextTraining.foco}</span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
            {nextTraining.titulo}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
            {nextTraining.data} às {nextTraining.horario} · {nextTraining.local}
          </p>
          {nextTraining.descricao && (
            <p className="text-[11px] text-slate-500 italic border-l-2 border-slate-200 dark:border-slate-700 pl-2">
              "{nextTraining.descricao}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

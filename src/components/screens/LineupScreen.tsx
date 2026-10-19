import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MODALITIES_CONFIG } from '../../constants/sports';
import { SportField } from '../pitch/SportField';
import { Lineup, TacticalSlot, Player } from '../../types';
import {
  Trophy,
  Share2,
  CheckCircle,
  RotateCcw,
  Users,
  ChevronRight,
  Info,
  X,
  Sparkles,
} from 'lucide-react';

interface LineupScreenProps {
  onOpenShareModal: (lineup: Lineup) => void;
}

export const LineupScreen: React.FC<LineupScreenProps> = ({ onOpenShareModal }) => {
  const {
    activeTeam,
    players,
    matches,
    lineups,
    saveLineup,
    publishLineup,
    currentUser,
  } = useApp();

  const isCoach = currentUser.role === 'tecnico';
  const config = activeTeam ? MODALITIES_CONFIG[activeTeam.modalidade] : null;

  // Selected match to associate lineup with
  const teamMatches = matches.filter((m) => m.timeId === activeTeam?.id && m.status === 'agendada');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    teamMatches[0]?.id || ''
  );

  // Active lineup or create working copy
  const existingLineup =
    lineups.find((l) => l.timeId === activeTeam?.id && l.partidaId === selectedMatchId) ||
    lineups.find((l) => l.timeId === activeTeam?.id && l.publicada) ||
    lineups.find((l) => l.timeId === activeTeam?.id);

  const [currentFormation, setCurrentFormation] = useState<string>(
    existingLineup?.formacao || config?.formations[0]?.name || '4-3-3'
  );

  const [workingSlots, setWorkingSlots] = useState<TacticalSlot[]>(() => {
    if (existingLineup && existingLineup.titulares.length > 0) {
      return existingLineup.titulares;
    }
    const template = config?.formations.find((f) => f.name === currentFormation) || config?.formations[0];
    return (
      template?.slots.map((s) => ({
        slotId: s.id,
        positionName: s.position,
        x: s.x,
        y: s.y,
        jogadorId: undefined,
      })) || []
    );
  });

  const [reserves, setReserves] = useState<string[]>(
    existingLineup?.reservasIds || []
  );

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isPlayerPickerOpen, setIsPlayerPickerOpen] = useState(false);
  const [publishedStatus, setPublishedStatus] = useState<boolean>(
    existingLineup?.publicada ?? false
  );
  const [notification, setNotification] = useState<string | null>(null);

  // Players map for easy lookup
  const teamPlayers = players.filter((p) => p.timeId === activeTeam?.id);
  const playersMap = Object.fromEntries(teamPlayers.map((p) => [p.id, p]));

  // If user is a linked player, find their ID to highlight on pitch
  const currentLinkedPlayer = currentUser.jogadorVinculadoId
    ? teamPlayers.find((p) => p.id === currentUser.jogadorVinculadoId)
    : teamPlayers.find((p) => p.usuarioUid === currentUser.uid);

  // Keep working slots in sync if team or formation changes
  useEffect(() => {
    if (!config) return;
    const template =
      config.formations.find((f) => f.name === currentFormation) || config.formations[0];

    // Preserve already assigned players if changing formation
    setWorkingSlots((prev) => {
      return template.slots.map((s, idx) => {
        const prevSlot = prev[idx];
        return {
          slotId: s.id,
          positionName: s.position,
          x: s.x,
          y: s.y,
          jogadorId: prevSlot ? prevSlot.jogadorId : undefined,
        };
      });
    });
  }, [currentFormation, config]);

  if (!activeTeam || !config) return null;

  // Selected slot object
  const activeSlot = workingSlots.find((s) => s.slotId === selectedSlotId);

  // Currently assigned player IDs (starters)
  const assignedPlayerIds = new Set(
    workingSlots.map((s) => s.jogadorId).filter(Boolean) as string[]
  );

  // Available players who are not currently assigned to a starter slot
  const unassignedPlayers = teamPlayers.filter(
    (p) => !assignedPlayerIds.has(p.id) && p.status === 'ativo'
  );

  // Handle slot click
  const handleSlotClick = (slotId: string) => {
    if (!isCoach) return;

    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
      setIsPlayerPickerOpen(false);
      return;
    }

    if (selectedSlotId && selectedSlotId !== slotId) {
      // SWAP PLAYERS BETWEEN SLOTS (RN09 compliant swap)
      const slotA = workingSlots.find((s) => s.slotId === selectedSlotId);
      const slotB = workingSlots.find((s) => s.slotId === slotId);

      if (slotA && slotB) {
        setWorkingSlots((prev) =>
          prev.map((s) => {
            if (s.slotId === slotA.slotId) return { ...s, jogadorId: slotB.jogadorId };
            if (s.slotId === slotB.slotId) return { ...s, jogadorId: slotA.jogadorId };
            return s;
          })
        );
        setSelectedSlotId(null);
        showNotice('Posições invertidas com sucesso!');
        return;
      }
    }

    setSelectedSlotId(slotId);
    setIsPlayerPickerOpen(true);
  };

  // Assign player to active slot
  const handleAssignPlayer = (playerId?: string) => {
    if (!selectedSlotId) return;

    // Remove from reserves if they were on bench
    if (playerId) {
      setReserves((prev) => prev.filter((id) => id !== playerId));
    }

    setWorkingSlots((prev) =>
      prev.map((s) => (s.slotId === selectedSlotId ? { ...s, jogadorId: playerId } : s))
    );
    setSelectedSlotId(null);
    setIsPlayerPickerOpen(false);
  };

  // Move player to bench / reserves
  const handleMoveToBench = (playerId: string) => {
    if (!reserves.includes(playerId)) {
      setReserves((prev) => [...prev, playerId]);
    }
    // Also remove from starter slot if they were starting
    setWorkingSlots((prev) =>
      prev.map((s) => (s.jogadorId === playerId ? { ...s, jogadorId: undefined } : s))
    );
  };

  // Remove from bench
  const handleRemoveFromBench = (playerId: string) => {
    setReserves((prev) => prev.filter((id) => id !== playerId));
  };

  // Save Lineup (UC04)
  const handleSaveLineup = () => {
    const lineupToSave: Lineup = {
      id: existingLineup?.id || `lineup-${activeTeam.id}-${Date.now()}`,
      timeId: activeTeam.id,
      partidaId: selectedMatchId || undefined,
      esporte: activeTeam.esporte,
      modalidade: activeTeam.modalidade,
      formacao: currentFormation,
      titulares: workingSlots,
      reservasIds: reserves,
      publicada: publishedStatus,
      atualizadoEm: new Date().toISOString(),
    };

    saveLineup(lineupToSave);
    showNotice('Escalação salva com sucesso!');
  };

  // Publish Lineup (RF16)
  const handlePublishLineup = () => {
    const lineupToSave: Lineup = {
      id: existingLineup?.id || `lineup-${activeTeam.id}-${Date.now()}`,
      timeId: activeTeam.id,
      partidaId: selectedMatchId || undefined,
      esporte: activeTeam.esporte,
      modalidade: activeTeam.modalidade,
      formacao: currentFormation,
      titulares: workingSlots,
      reservasIds: reserves,
      publicada: true,
      atualizadoEm: new Date().toISOString(),
    };

    saveLineup(lineupToSave);
    publishLineup(lineupToSave.id);
    setPublishedStatus(true);
    showNotice('Escalação oficial publicada para o elenco!');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Count assigned starters
  const assignedCount = workingSlots.filter((s) => !!s.jogadorId).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header and Match Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Prancheta de Escalação
            </h2>
            {publishedStatus && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Oficial Publicada
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {config.name} · {assignedCount} de {config.maxStarters} atletas escalados
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              onOpenShareModal({
                id: existingLineup?.id || 'temp',
                timeId: activeTeam.id,
                partidaId: selectedMatchId || undefined,
                esporte: activeTeam.esporte,
                modalidade: activeTeam.modalidade,
                formacao: currentFormation,
                titulares: workingSlots,
                reservasIds: reserves,
                publicada: publishedStatus,
                atualizadoEm: new Date().toISOString(),
              })
            }
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhar</span>
          </button>

          {isCoach && (
            <>
              <button
                onClick={handleSaveLineup}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Salvar
              </button>
              <button
                onClick={handlePublishLineup}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Publicar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Match Link and Formation Selector Bar */}
      {isCoach ? (
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Vincular a Partida:
              </label>
              <select
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">Escalação Padrão da Equipe</option>
                {teamMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    vs {m.adversario} ({m.data})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Esquema Tático / Formação:
              </label>
              <select
                value={currentFormation}
                onChange={(e) => setCurrentFormation(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                {config.formations.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description of formation */}
          {(() => {
            const formDesc = config.formations.find((f) => f.name === currentFormation)?.description;
            return formDesc ? (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                <span>{formDesc}</span>
              </p>
            ) : null;
          })()}
        </div>
      ) : (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
          <span>Formação Oficial: <strong>{currentFormation}</strong></span>
          {currentLinkedPlayer && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Sua camisa #{currentLinkedPlayer.numero} está destacada em verde!
            </span>
          )}
        </div>
      )}

      {/* Interactive Pitch Board */}
      <div className="space-y-2">
        <SportField
          modalityId={activeTeam.modalidade}
          slots={workingSlots}
          playersMap={playersMap}
          selectedSlotId={selectedSlotId}
          onSlotClick={handleSlotClick}
          readOnly={!isCoach}
          highlightPlayerId={currentLinkedPlayer?.id}
        />

        {isCoach && (
          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
            Toque em uma posição para escalar um atleta. Toque em duas posições para invertê-las.
          </p>
        )}
      </div>

      {/* Reserves / Bench Area */}
      <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              Banco de Reservas ({reserves.length})
            </h3>
          </div>
          {isCoach && unassignedPlayers.length > 0 && (
            <span className="text-[11px] text-slate-500">
              {unassignedPlayers.length} atletas disponíveis no elenco
            </span>
          )}
        </div>

        {/* Bench list chips */}
        <div className="flex flex-wrap gap-2">
          {reserves.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Nenhum reserva selecionado. Adicione atletas disponíveis abaixo.
            </p>
          ) : (
            reserves.map((resId) => {
              const pl = playersMap[resId];
              if (!pl) return null;
              return (
                <div
                  key={pl.id}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 flex items-center gap-2 text-xs"
                >
                  <span className="font-athletic font-bold text-slate-900 dark:text-white tabular-nums">
                    #{pl.numero}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {pl.apelido || pl.nome.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400">({pl.posicao})</span>

                  {isCoach && (
                    <button
                      onClick={() => handleRemoveFromBench(pl.id)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick add to bench (Coach only) */}
        {isCoach && unassignedPlayers.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
              Enviar para o Banco:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {unassignedPlayers
                .filter((p) => !reserves.includes(p.id))
                .slice(0, 8)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleMoveToBench(p.id)}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer flex items-center gap-1"
                  >
                    <span>+ #{p.numero} {p.apelido || p.nome.split(' ')[0]}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Player Selection Bottom Sheet / Modal */}
      {isPlayerPickerOpen && activeSlot && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Escalar Posição: {activeSlot.positionName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Selecione um atleta disponível do elenco
                </p>
              </div>
              <button
                onClick={() => setIsPlayerPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
              {/* Option to clear slot */}
              {activeSlot.jogadorId && (
                <button
                  onClick={() => handleAssignPlayer(undefined)}
                  className="w-full p-2.5 rounded-xl border border-dashed border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 text-center cursor-pointer transition-colors"
                >
                  Remover jogador desta posição (Deixar vago)
                </button>
              )}

              {/* Compatible Position Players First */}
              <div className="space-y-1.5">
                {teamPlayers.map((player) => {
                  const isAssigned = assignedPlayerIds.has(player.id);
                  const isCurrentlyInSlot = activeSlot.jogadorId === player.id;
                  const isMatchPos = player.posicao === activeSlot.positionName;
                  const isInjured = player.status === 'lesionado';

                  return (
                    <button
                      key={player.id}
                      disabled={isCurrentlyInSlot || isInjured}
                      onClick={() => handleAssignPlayer(player.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrentlyInSlot
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 opacity-80'
                          : isInjured
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                          : isAssigned
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 hover:border-amber-400'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-athletic font-bold text-sm flex items-center justify-center">
                          {player.numero}
                        </span>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {player.nome}
                            </span>
                            {player.apelido && (
                              <span className="text-[11px] text-slate-400">"{player.apelido}"</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className={isMatchPos ? 'text-emerald-600 font-bold' : ''}>
                              {player.posicao}
                            </span>
                            {isInjured && <span className="text-red-500">· Departamento Médico</span>}
                            {isAssigned && !isCurrentlyInSlot && (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                · Já escalado (substituirá)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

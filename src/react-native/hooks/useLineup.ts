import { useState, useEffect, useCallback } from 'react';
import { lineupService, SaveLineupDTO } from '../services/firebase/lineupService';
import { Lineup, TacticalSlot, SportId, ModalityId } from '../../types';
import { MODALITIES_CONFIG } from '../../constants/sports';

export function useLineup(timeId?: string, matchId?: string, modality?: ModalityId, sport?: SportId) {
  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<string>('');
  const [startersSlots, setStartersSlots] = useState<TacticalSlot[]>([]);
  const [benchPlayerIds, setBenchPlayerIds] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa formação padrão conforme a modalidade
  const initDefaultSlots = useCallback((mod: ModalityId, formationName?: string) => {
    const config = MODALITIES_CONFIG[mod];
    if (!config || !config.formations || config.formations.length === 0) return;

    const template = formationName
      ? config.formations.find(f => f.name === formationName) || config.formations[0]
      : config.formations[0];

    setSelectedFormation(template.name);
    setStartersSlots(
      template.slots.map(s => ({
        slotId: s.id,
        positionName: s.position,
        x: s.x,
        y: s.y,
        jogadorId: undefined,
      }))
    );
  }, []);

  // Carrega escalação existente (da partida ou a mais recente do time)
  const fetchLineup = useCallback(async () => {
    if (!timeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let existingLineup: Lineup | null = null;
      if (matchId) {
        existingLineup = await lineupService.getLineupByMatch(matchId);
      } else {
        existingLineup = await lineupService.getLatestLineupByTeam(timeId);
      }

      if (existingLineup) {
        setLineup(existingLineup);
        setSelectedFormation(existingLineup.formacao);
        setStartersSlots(existingLineup.titulares);
        setBenchPlayerIds(existingLineup.reservasIds || []);
        setIsPublished(existingLineup.publicada);
      } else if (modality) {
        initDefaultSlots(modality);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar escalação.');
    } finally {
      setLoading(false);
    }
  }, [timeId, matchId, modality, initDefaultSlots]);

  useEffect(() => {
    fetchLineup();
  }, [fetchLineup]);

  // Altera formação e rearranja os slots mantendo os jogadores já alocados quando possível
  const changeFormation = useCallback(
    (newFormationName: string) => {
      if (!modality) return;
      const config = MODALITIES_CONFIG[modality];
      const template = config.formations.find(f => f.name === newFormationName);
      if (!template) return;

      setSelectedFormation(newFormationName);

      // Preserva jogadores alocados nos slots por índice
      const previousAssigned = startersSlots.map(s => s.jogadorId);

      const newSlots: TacticalSlot[] = template.slots.map((s, index) => ({
        slotId: s.id,
        positionName: s.position,
        x: s.x,
        y: s.y,
        jogadorId: previousAssigned[index] || undefined,
      }));

      setStartersSlots(newSlots);
    },
    [modality, startersSlots]
  );

  // Escala jogador como titular no slot especificado
  const assignStarter = useCallback((slotId: string, playerId: string) => {
    setStartersSlots(prev =>
      prev.map(slot => {
        // Se este for o slot alvo, atribui o jogador
        if (slot.slotId === slotId) {
          return { ...slot, jogadorId: playerId };
        }
        // RN09: Se o jogador já estiver em outro slot, limpa o slot anterior
        if (slot.jogadorId === playerId) {
          return { ...slot, jogadorId: undefined };
        }
        return slot;
      })
    );

    // Se o jogador estiver no banco, remove do banco
    setBenchPlayerIds(prev => prev.filter(id => id !== playerId));
  }, []);

  // Remove jogador do slot de titular
  const unassignStarter = useCallback((slotId: string) => {
    setStartersSlots(prev =>
      prev.map(slot => (slot.slotId === slotId ? { ...slot, jogadorId: undefined } : slot))
    );
  }, []);

  // Adiciona / remove reserva do banco
  const toggleBenchPlayer = useCallback((playerId: string) => {
    setBenchPlayerIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        // RN09: Remove de qualquer slot de titular
        setStartersSlots(slots =>
          slots.map(s => (s.jogadorId === playerId ? { ...s, jogadorId: undefined } : s))
        );
        return [...prev, playerId];
      }
    });
  }, []);

  // Salva a escalação no Firestore
  const saveCurrentLineup = useCallback(async () => {
    if (!timeId || !modality || !sport) {
      throw new Error('Dados de equipe/modalidade incompletos.');
    }

    setSaving(true);
    setError(null);
    try {
      const dto: SaveLineupDTO = {
        id: lineup?.id,
        partidaId: matchId,
        esporte: sport,
        modalidade: modality,
        formacao: selectedFormation,
        titulares: startersSlots,
        reservasIds: benchPlayerIds,
        publicada: isPublished,
      };

      const saved = await lineupService.saveLineup(timeId, dto);
      setLineup(saved);
      return saved;
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar escalação.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [timeId, modality, sport, lineup?.id, matchId, selectedFormation, startersSlots, benchPlayerIds, isPublished]);

  // RF16: Publica a escalação para os atletas
  const togglePublish = useCallback(async () => {
    if (!lineup?.id) {
      // Salva antes de publicar
      const saved = await saveCurrentLineup();
      await lineupService.publishLineup(saved.id, true);
      setIsPublished(true);
      setLineup(prev => (prev ? { ...prev, publicada: true } : prev));
      return;
    }

    const nextState = !isPublished;
    await lineupService.publishLineup(lineup.id, nextState);
    setIsPublished(nextState);
    setLineup(prev => (prev ? { ...prev, publicada: nextState } : prev));
  }, [lineup?.id, isPublished, saveCurrentLineup]);

  return {
    lineup,
    selectedFormation,
    startersSlots,
    benchPlayerIds,
    isPublished,
    loading,
    saving,
    error,
    changeFormation,
    assignStarter,
    unassignStarter,
    toggleBenchPlayer,
    saveCurrentLineup,
    togglePublish,
    reloadLineup: fetchLineup,
  };
}

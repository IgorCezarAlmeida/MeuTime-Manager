import { useState, useEffect, useCallback } from 'react';
import { tacticService, CreateTacticDTO } from '../services/firebase/tacticService';
import { Tactic, ModalityId } from '../../types';

export function useTactics(timeId?: string, modality?: ModalityId) {
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTactics = useCallback(async (id: string, mod?: ModalityId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tacticService.getTacticsByTeam(id, mod);
      setTactics(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar táticas.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeId) {
      fetchTactics(timeId, modality);
    } else {
      setTactics([]);
      setLoading(false);
    }
  }, [timeId, modality, fetchTactics]);

  const createTactic = useCallback(
    async (dto: CreateTacticDTO) => {
      if (!timeId) throw new Error('Time não selecionado.');
      setLoading(true);
      setError(null);
      try {
        const newTactic = await tacticService.createTactic(timeId, dto);
        setTactics(prev => [newTactic, ...prev]);
        return newTactic;
      } catch (err: any) {
        setError(err.message || 'Erro ao salvar tática.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [timeId]
  );

  const updateTactic = useCallback(
    async (tacticId: string, updates: Partial<CreateTacticDTO>) => {
      setLoading(true);
      setError(null);
      try {
        await tacticService.updateTactic(tacticId, updates);
        setTactics(prev =>
          prev.map(t => (t.id === tacticId ? ({ ...t, ...updates } as Tactic) : t))
        );
      } catch (err: any) {
        setError(err.message || 'Erro ao atualizar tática.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTactic = useCallback(
    async (tacticId: string) => {
      setLoading(true);
      setError(null);
      try {
        await tacticService.deleteTactic(tacticId);
        setTactics(prev => prev.filter(t => t.id !== tacticId));
      } catch (err: any) {
        setError(err.message || 'Erro ao remover tática.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    tactics,
    loading,
    error,
    createTactic,
    updateTactic,
    deleteTactic,
    reloadTactics: () => timeId && fetchTactics(timeId, modality),
  };
}

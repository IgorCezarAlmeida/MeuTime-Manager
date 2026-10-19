import { useState, useEffect, useCallback } from 'react';
import { trainingService, CreateTrainingDTO } from '../services/firebase/trainingService';
import { Training } from '../../types';

export function useTrainings(timeId?: string) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainings = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await trainingService.getTrainingsByTeam(id);
      setTrainings(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar treinos.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeId) {
      fetchTrainings(timeId);
    } else {
      setTrainings([]);
      setLoading(false);
    }
  }, [timeId, fetchTrainings]);

  const createTraining = useCallback(
    async (dto: CreateTrainingDTO) => {
      if (!timeId) throw new Error('Time não selecionado.');
      setLoading(true);
      setError(null);
      try {
        const newTraining = await trainingService.createTraining(timeId, dto);
        setTrainings(prev => [newTraining, ...prev]);
        return newTraining;
      } catch (err: any) {
        setError(err.message || 'Erro ao agendar treino.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [timeId]
  );

  const updateTraining = useCallback(
    async (trainingId: string, updates: Partial<CreateTrainingDTO>) => {
      setLoading(true);
      setError(null);
      try {
        await trainingService.updateTraining(trainingId, updates);
        setTrainings(prev =>
          prev.map(t => (t.id === trainingId ? ({ ...t, ...updates } as Training) : t))
        );
      } catch (err: any) {
        setError(err.message || 'Erro ao atualizar treino.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTraining = useCallback(
    async (trainingId: string) => {
      setLoading(true);
      setError(null);
      try {
        await trainingService.deleteTraining(trainingId);
        setTrainings(prev => prev.filter(t => t.id !== trainingId));
      } catch (err: any) {
        setError(err.message || 'Erro ao excluir treino.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    trainings,
    loading,
    error,
    createTraining,
    updateTraining,
    deleteTraining,
    reloadTrainings: () => timeId && fetchTrainings(timeId),
  };
}

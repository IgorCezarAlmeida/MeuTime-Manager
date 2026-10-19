import { useState, useEffect, useCallback, useMemo } from 'react';
import { matchService, CreateMatchDTO } from '../services/firebase/matchService';
import { Match, MatchResult } from '../../types';

export function useMatches(timeId?: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await matchService.getMatchesByTeam(id);
      setMatches(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar partidas.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeId) {
      fetchMatches(timeId);
    } else {
      setMatches([]);
      setLoading(false);
    }
  }, [timeId, fetchMatches]);

  const createMatch = useCallback(
    async (dto: CreateMatchDTO) => {
      if (!timeId) throw new Error('Time não selecionado.');
      setLoading(true);
      setError(null);
      try {
        const newMatch = await matchService.createMatch(timeId, dto);
        setMatches(prev => [newMatch, ...prev]);
        return newMatch;
      } catch (err: any) {
        setError(err.message || 'Erro ao agendar partida.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [timeId]
  );

  const updateMatch = useCallback(
    async (matchId: string, updates: Partial<CreateMatchDTO>) => {
      setLoading(true);
      setError(null);
      try {
        await matchService.updateMatch(matchId, updates);
        setMatches(prev =>
          prev.map(m => (m.id === matchId ? ({ ...m, ...updates } as Match) : m))
        );
      } catch (err: any) {
        setError(err.message || 'Erro ao atualizar partida.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const recordResult = useCallback(
    async (matchId: string, result: MatchResult) => {
      setLoading(true);
      setError(null);
      try {
        await matchService.registerMatchResult(matchId, result);
        setMatches(prev =>
          prev.map(m =>
            m.id === matchId ? { ...m, status: 'finalizada', resultado: result } : m
          )
        );
      } catch (err: any) {
        setError(err.message || 'Erro ao registrar resultado.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteMatch = useCallback(
    async (matchId: string) => {
      setLoading(true);
      setError(null);
      try {
        await matchService.deleteMatch(matchId);
        setMatches(prev => prev.filter(m => m.id !== matchId));
      } catch (err: any) {
        setError(err.message || 'Erro ao excluir partida.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const upcomingMatches = useMemo(() => {
    return matches.filter(m => m.status === 'agendada');
  }, [matches]);

  const pastMatches = useMemo(() => {
    return matches.filter(m => m.status === 'finalizada' || m.status === 'cancelada');
  }, [matches]);

  return {
    matches,
    upcomingMatches,
    pastMatches,
    loading,
    error,
    createMatch,
    updateMatch,
    recordResult,
    deleteMatch,
    reloadMatches: () => timeId && fetchMatches(timeId),
  };
}

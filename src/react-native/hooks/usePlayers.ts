import { useState, useEffect, useCallback, useMemo } from 'react';
import { playerService, CreatePlayerDTO } from '../services/firebase/playerService';
import { Player, PlayerStatus } from '../../types';

export function usePlayers(timeId?: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchPlayers = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const squad = await playerService.getPlayersByTeam(id, false);
      setPlayers(squad);
      return squad;
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar elenco.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeId) {
      fetchPlayers(timeId);
    } else {
      setPlayers([]);
      setLoading(false);
    }
  }, [timeId, fetchPlayers]);

  const addPlayer = useCallback(
    async (dto: CreatePlayerDTO) => {
      if (!timeId) throw new Error('Time não selecionado.');
      setLoading(true);
      setError(null);
      try {
        const newPlayer = await playerService.addPlayer(timeId, dto);
        setPlayers(prev => [...prev, newPlayer].sort((a, b) => a.numero - b.numero));
        return newPlayer;
      } catch (err: any) {
        setError(err.message || 'Erro ao cadastrar jogador.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [timeId]
  );

  const updatePlayer = useCallback(
    async (playerId: string, updates: Partial<CreatePlayerDTO>) => {
      setLoading(true);
      setError(null);
      try {
        await playerService.updatePlayer(playerId, updates);
        setPlayers(prev =>
          prev
            .map(p => (p.id === playerId ? ({ ...p, ...updates } as Player) : p))
            .sort((a, b) => a.numero - b.numero)
        );
      } catch (err: any) {
        setError(err.message || 'Erro ao editar jogador.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removePlayer = useCallback(
    async (playerId: string, permanent: boolean = false) => {
      setLoading(true);
      setError(null);
      try {
        // RN11: Soft delete por padrão para preservar histórico esportivo
        await playerService.removePlayer(playerId, permanent);
        setPlayers(prev => prev.filter(p => p.id !== playerId));
      } catch (err: any) {
        setError(err.message || 'Erro ao remover atleta.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const linkAccount = useCallback(
    async (playerId: string, userUid: string) => {
      setLoading(true);
      setError(null);
      try {
        await playerService.linkAccountToPlayer(playerId, userUid);
        setPlayers(prev =>
          prev.map(p => (p.id === playerId ? { ...p, usuarioUid: userUid } : p))
        );
      } catch (err: any) {
        setError(err.message || 'Erro ao vincular conta.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchPos = filterPosition === 'all' || p.posicao.toLowerCase() === filterPosition.toLowerCase();
      const matchStat = filterStatus === 'all' || p.status === filterStatus;
      return matchPos && matchStat;
    });
  }, [players, filterPosition, filterStatus]);

  return {
    players,
    filteredPlayers,
    loading,
    error,
    filterPosition,
    setFilterPosition,
    filterStatus,
    setFilterStatus,
    addPlayer,
    updatePlayer,
    removePlayer,
    linkAccount,
    reloadPlayers: () => timeId && fetchPlayers(timeId),
  };
}

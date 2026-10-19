import { useState, useEffect, useCallback } from 'react';
import { teamService, CreateTeamDTO } from '../services/firebase/teamService';
import { Team, ModalityConfig } from '../../types';
import { MODALITIES_CONFIG } from '../../constants/sports';

export function useTeam(teamId?: string, coachUid?: string) {
  const [team, setTeam] = useState<Team | null>(null);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamService.getTeamById(id);
      setTeam(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar time.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyTeams = useCallback(async (uid: string) => {
    try {
      const list = await teamService.listTeamsByCoach(uid);
      setMyTeams(list);
      return list;
    } catch (err: any) {
      console.error('Erro ao listar times do técnico:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
    } else {
      setLoading(false);
    }
  }, [teamId, fetchTeam]);

  useEffect(() => {
    if (coachUid) {
      fetchMyTeams(coachUid);
    }
  }, [coachUid, fetchMyTeams]);

  const createTeam = useCallback(
    async (currentCoachUid: string, coachName: string, dto: CreateTeamDTO) => {
      setLoading(true);
      setError(null);
      try {
        const newTeam = await teamService.createTeam(currentCoachUid, coachName, dto);
        setTeam(newTeam);
        setMyTeams(prev => [...prev, newTeam]);
        return newTeam;
      } catch (err: any) {
        setError(err.message || 'Erro ao criar equipe.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTeam = useCallback(
    async (currentUid: string, updates: Partial<Omit<Team, 'id' | 'tecnicoUid' | 'codigoConvite'>>) => {
      if (!team?.id) return;
      setLoading(true);
      setError(null);
      try {
        await teamService.updateTeam(team.id, currentUid, updates);
        setTeam(prev => (prev ? { ...prev, ...updates } : null));
      } catch (err: any) {
        setError(err.message || 'Erro ao atualizar equipe.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [team?.id]
  );

  const findTeamByInvite = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const found = await teamService.getTeamByInviteCode(code);
      return found;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar time pelo convite.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const modalityConfig: ModalityConfig | null = team?.modalidade
    ? MODALITIES_CONFIG[team.modalidade]
    : null;

  return {
    team,
    setTeam,
    myTeams,
    modalityConfig,
    loading,
    error,
    createTeam,
    updateTeam,
    findTeamByInvite,
    reloadTeam: () => team?.id && fetchTeam(team.id),
  };
}

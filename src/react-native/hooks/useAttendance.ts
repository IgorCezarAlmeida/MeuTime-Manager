import { useState, useEffect, useCallback, useMemo } from 'react';
import { attendanceService, SetAttendanceDTO } from '../services/firebase/attendanceService';
import { Attendance, AttendanceStatus } from '../../types';

export function useAttendance(eventoTipo?: 'partida' | 'treino', eventoId?: string, timeId?: string) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async (type: 'partida' | 'treino', id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getAttendanceByEvent(type, id);
      setAttendances(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar presenças.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (eventoTipo && eventoId) {
      fetchAttendance(eventoTipo, eventoId);
    } else {
      setAttendances([]);
      setLoading(false);
    }
  }, [eventoTipo, eventoId, fetchAttendance]);

  const setPlayerAttendance = useCallback(
    async (jogadorId: string, status: AttendanceStatus, justificativa?: string) => {
      if (!timeId || !eventoTipo || !eventoId) {
        throw new Error('Parâmetros de evento incompletos.');
      }

      setLoading(true);
      setError(null);
      try {
        const dto: SetAttendanceDTO = {
          timeId,
          eventoTipo,
          eventoId,
          jogadorId,
          status,
          justificativa,
        };
        const updated = await attendanceService.setAttendance(dto);
        setAttendances(prev => {
          const index = prev.findIndex(a => a.jogadorId === jogadorId);
          if (index >= 0) {
            const next = [...prev];
            next[index] = updated;
            return next;
          }
          return [...prev, updated];
        });
        return updated;
      } catch (err: any) {
        setError(err.message || 'Erro ao registrar presença.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [timeId, eventoTipo, eventoId]
  );

  const stats = useMemo(() => {
    const confirmados = attendances.filter(a => a.status === 'confirmado').length;
    const recusados = attendances.filter(a => a.status === 'recusado').length;
    const duvidas = attendances.filter(a => a.status === 'duvida').length;
    return {
      confirmados,
      recusados,
      duvidas,
      total: attendances.length,
    };
  }, [attendances]);

  return {
    attendances,
    stats,
    loading,
    error,
    setPlayerAttendance,
    reloadAttendance: () => eventoTipo && eventoId && fetchAttendance(eventoTipo, eventoId),
  };
}

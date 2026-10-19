import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Match, MatchType, MatchStatus, MatchResult } from '../../../types';
import { playerService } from './playerService';

/**
 * SERVIÇO DE GESTÃO DE PARTIDAS (CRUD PARTIDAS)
 * Requisitos: RF10, RF20, RF21, RF22
 * Regras de Negócio: RN06
 */

export interface CreateMatchDTO {
  adversario: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  local: string;
  tipo: MatchType;
  observacoes?: string;
  escalacaoId?: string;
}

export const matchService = {
  /**
   * RF10: Cadastrar nova partida para a equipe
   */
  async createMatch(timeId: string, data: CreateMatchDTO): Promise<Match> {
    if (!timeId) {
      throw new Error('O ID da equipe é obrigatório para agendar a partida.');
    }
    if (!data.adversario?.trim()) {
      throw new Error('O nome do adversário é obrigatório.');
    }
    if (!data.data || !data.horario) {
      throw new Error('Data e horário da partida são obrigatórios.');
    }

    const matchDocRef = doc(collection(db, COLLECTIONS.PARTIDAS));
    const matchId = matchDocRef.id;

    const novaPartida: Match = {
      id: matchId,
      timeId,
      adversario: data.adversario.trim(),
      data: data.data,
      horario: data.horario,
      local: data.local?.trim() || 'A definir',
      tipo: data.tipo || 'amistoso',
      status: 'agendada',
      observacoes: data.observacoes?.trim() || undefined,
      escalacaoId: data.escalacaoId || undefined,
    };

    await setDoc(matchDocRef, {
      ...novaPartida,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    return novaPartida;
  },

  /**
   * RF10 & RF21: Listar histórico de partidas de uma equipe
   */
  async getMatchesByTeam(timeId: string): Promise<Match[]> {
    const q = query(
      collection(db, COLLECTIONS.PARTIDAS),
      where('timeId', '==', timeId)
    );
    const querySnapshot = await getDocs(q);

    const matches = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Match[];

    // Ordena por data e horário (mais recentes primeiro para histórico ou futuras primeiro)
    return matches.sort((a, b) => {
      const dateA = new Date(`${a.data}T${a.horario}`).getTime();
      const dateB = new Date(`${b.data}T${b.horario}`).getTime();
      return dateB - dateA;
    });
  },

  /**
   * Buscar partida por ID
   */
  async getMatchById(matchId: string): Promise<Match | null> {
    const docRef = doc(db, COLLECTIONS.PARTIDAS, matchId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Match;
  },

  /**
   * Atualizar dados da partida (data, local, adversário, etc.)
   */
  async updateMatch(matchId: string, updates: Partial<CreateMatchDTO>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PARTIDAS, matchId);
    await updateDoc(docRef, {
      ...updates,
      atualizadoEm: serverTimestamp(),
    });
  },

  /**
   * RF20 & RF22: Registrar resultado da partida e atualizar estatísticas
   */
  async registerMatchResult(matchId: string, result: MatchResult): Promise<void> {
    const match = await this.getMatchById(matchId);
    if (!match) {
      throw new Error('Partida não encontrada.');
    }

    const docRef = doc(db, COLLECTIONS.PARTIDAS, matchId);
    await updateDoc(docRef, {
      status: 'finalizada' as MatchStatus,
      resultado: result,
      atualizadoEm: serverTimestamp(),
    });

    // Se houver gols marcados registrados, atualiza estatísticas individuais dos atletas (RF22)
    if (result.golsMarcados && result.golsMarcados.length > 0) {
      for (const gol of result.golsMarcados) {
        if (gol.jogadorId) {
          await playerService.updatePlayerStats(gol.jogadorId, { gols: 1 });
        }
      }
    }
  },

  /**
   * Cancelar ou remover partida
   */
  async deleteMatch(matchId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PARTIDAS, matchId);
    await deleteDoc(docRef);
  },
};

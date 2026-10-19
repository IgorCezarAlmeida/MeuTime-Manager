import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Attendance, AttendanceStatus } from '../../../types';

/**
 * SERVIÇO DE CONTROLE DE PRESENÇA (CRUD PRESENÇA)
 * Requisitos: RF17, RF18, RF19
 * Regras de Negócio: RN08
 * Casos de Uso: UC05 (Confirmar presença)
 */

export interface SetAttendanceDTO {
  timeId: string;
  eventoTipo: 'partida' | 'treino';
  eventoId: string;
  jogadorId: string;
  status: AttendanceStatus;
  justificativa?: string;
}

export const attendanceService = {
  /**
   * UC05 / RF17 / RF18 / RN08: Registrar ou alterar confirmação de presença
   * Utiliza ID determinístico baseado no evento e jogador para garantir idempotência (sem duplicação)
   */
  async setAttendance(data: SetAttendanceDTO): Promise<Attendance> {
    const presenceId = `${data.eventoTipo}_${data.eventoId}_${data.jogadorId}`;
    const docRef = doc(db, COLLECTIONS.PRESENCAS, presenceId);

    const presencaData: Attendance = {
      id: presenceId,
      timeId: data.timeId,
      eventoTipo: data.eventoTipo,
      eventoId: data.eventoId,
      jogadorId: data.jogadorId,
      status: data.status,
      justificativa: data.justificativa?.trim() || undefined,
      atualizadoEm: new Date().toISOString(),
    };

    await setDoc(docRef, {
      ...presencaData,
      atualizadoEmServer: serverTimestamp(),
    }, { merge: true });

    return presencaData;
  },

  /**
   * RF19: Consultar a disponibilidade de todos os jogadores para um evento (partida ou treino)
   * Usado pelo técnico para montar a escalação e planejar o evento
   */
  async getAttendanceByEvent(eventoTipo: 'partida' | 'treino', eventoId: string): Promise<Attendance[]> {
    const q = query(
      collection(db, COLLECTIONS.PRESENCAS),
      where('eventoTipo', '==', eventoTipo),
      where('eventoId', '==', eventoId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Attendance[];
  },

  /**
   * Consultar status de presença de um atleta específico em um evento
   */
  async getPlayerEventAttendance(
    eventoTipo: 'partida' | 'treino',
    eventoId: string,
    jogadorId: string
  ): Promise<Attendance | null> {
    const presenceId = `${eventoTipo}_${eventoId}_${jogadorId}`;
    const docRef = doc(db, COLLECTIONS.PRESENCAS, presenceId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Attendance;
  },

  /**
   * Histórico de presenças de um jogador no time
   */
  async getPlayerHistory(timeId: string, jogadorId: string): Promise<Attendance[]> {
    const q = query(
      collection(db, COLLECTIONS.PRESENCAS),
      where('timeId', '==', timeId),
      where('jogadorId', '==', jogadorId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Attendance[];
  },
};

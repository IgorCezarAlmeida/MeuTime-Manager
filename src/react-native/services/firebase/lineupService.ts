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
  serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Lineup, TacticalSlot, SportId, ModalityId } from '../../../types';
import { MODALITIES_CONFIG } from '../../../constants/sports';

/**
 * SERVIÇO DE GESTÃO DE ESCALAÇÕES (CRUD ESCALAÇÕES)
 * Requisitos: RF12, RF13, RF14, RF16, RF23
 * Regras de Negócio: RN07, RN09, RN10, RN14, RN15
 * Casos de Uso: UC04 (Criar escalação)
 */

export interface SaveLineupDTO {
  id?: string;
  partidaId?: string;
  esporte: SportId;
  modalidade: ModalityId;
  formacao: string;
  titulares: TacticalSlot[];
  reservasIds: string[];
  publicada?: boolean;
}

export const lineupService = {
  /**
   * UC04 / RF12 / RN07: Salvar ou atualizar escalação oficial
   * Validações de integridade esportiva:
   * - RN09: Um atleta não pode ocupar duas posições simultaneamente.
   * - RN10: Quantidade de titulares não pode exceder o limite da modalidade.
   * - RN14: Formação compatível com a modalidade.
   */
  async saveLineup(timeId: string, data: SaveLineupDTO): Promise<Lineup> {
    if (!timeId) {
      throw new Error('O ID da equipe é obrigatório.');
    }

    const config = MODALITIES_CONFIG[data.modalidade];
    if (!config) {
      throw new Error(`RN14: Modalidade esportiva inválida: ${data.modalidade}`);
    }

    // RN10: Validar quantidade de jogadores escalados como titulares
    const assignedStarters = data.titulares.filter(s => !!s.jogadorId);
    if (assignedStarters.length > config.maxStarters) {
      throw new Error(
        `RN10: A modalidade ${config.name} permite no máximo ${config.maxStarters} titulares em campo/quadra.`
      );
    }

    // RN09: Validar que nenhum jogador ocupa dois slots ao mesmo tempo
    const assignedIds = data.titulares
      .map(s => s.jogadorId)
      .filter((id): id is string => !!id);

    const uniqueAssignedIds = new Set(assignedIds);
    if (uniqueAssignedIds.size !== assignedIds.length) {
      throw new Error('RN09: Um jogador não pode ocupar duas posições simultaneamente na mesma escalação.');
    }

    // Validar se nenhum reserva também está entre os titulares
    for (const reservaId of data.reservasIds) {
      if (uniqueAssignedIds.has(reservaId)) {
        throw new Error('RN09: Um jogador não pode estar simultaneamente entre os titulares e reservas.');
      }
    }

    const lineupDocRef = data.id
      ? doc(db, COLLECTIONS.ESCALACOES, data.id)
      : doc(collection(db, COLLECTIONS.ESCALACOES));

    const lineupId = lineupDocRef.id;

    const lineupData: Lineup = {
      id: lineupId,
      timeId,
      partidaId: data.partidaId || undefined,
      esporte: data.esporte,
      modalidade: data.modalidade,
      formacao: data.formacao,
      titulares: data.titulares,
      reservasIds: data.reservasIds || [],
      publicada: data.publicada ?? false,
      atualizadoEm: new Date().toISOString(),
    };

    await setDoc(lineupDocRef, {
      ...lineupData,
      atualizadoEmServer: serverTimestamp(),
    });

    // Se estiver associada a uma partida, vincula a escalação ao documento da partida
    if (data.partidaId) {
      const matchDocRef = doc(db, COLLECTIONS.PARTIDAS, data.partidaId);
      await updateDoc(matchDocRef, {
        escalacaoId: lineupId,
        atualizadoEm: serverTimestamp(),
      });
    }

    return lineupData;
  },

  /**
   * Buscar escalação associada a uma partida específica
   */
  async getLineupByMatch(partidaId: string): Promise<Lineup | null> {
    const q = query(
      collection(db, COLLECTIONS.ESCALACOES),
      where('partidaId', '==', partidaId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Lineup;
  },

  /**
   * Buscar a última escalação de uma equipe
   */
  async getLatestLineupByTeam(timeId: string): Promise<Lineup | null> {
    const q = query(
      collection(db, COLLECTIONS.ESCALACOES),
      where('timeId', '==', timeId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lineup));
    docs.sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());
    return docs[0];
  },

  /**
   * RF16: Publicar escalação para visualização dos atletas
   */
  async publishLineup(lineupId: string, isPublished: boolean = true): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ESCALACOES, lineupId);
    await updateDoc(docRef, {
      publicada: isPublished,
      atualizadoEm: new Date().toISOString(),
      publicadoEmServer: serverTimestamp(),
    });
  },

  /**
   * Excluir escalação
   */
  async deleteLineup(lineupId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ESCALACOES, lineupId);
    await deleteDoc(docRef);
  },
};

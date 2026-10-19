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
import { Tactic, ModalityId } from '../../../types';

/**
 * SERVIÇO DE GESTÃO DE TÁTICAS (CRUD TÁTICAS)
 * Requisitos: RF15
 * Regras de Negócio: RN13
 */

export interface CreateTacticDTO {
  modalidade: ModalityId;
  titulo: string;
  formacao: string;
  mentalidade: 'Defensiva' | 'Equilibrada' | 'Ofensiva';
  pressao: 'Baixa' | 'Média' | 'Alta';
  instrucoes: string[];
}

export const tacticService = {
  /**
   * RF15 & RN13: Criar e salvar prancheta/estratégia tática
   */
  async createTactic(timeId: string, data: CreateTacticDTO): Promise<Tactic> {
    if (!timeId) {
      throw new Error('O ID da equipe é obrigatório para salvar a tática.');
    }
    if (!data.titulo?.trim()) {
      throw new Error('O título da tática é obrigatório.');
    }
    if (!data.modalidade) {
      throw new Error('RN13: Uma tática deve estar associada a uma modalidade compatível.');
    }

    const docRef = doc(collection(db, COLLECTIONS.TATICAS));
    const tacticId = docRef.id;

    const novaTatica: Tactic = {
      id: tacticId,
      timeId,
      modalidade: data.modalidade,
      titulo: data.titulo.trim(),
      formacao: data.formacao,
      mentalidade: data.mentalidade,
      pressao: data.pressao,
      instrucoes: data.instrucoes || [],
      criadaEm: new Date().toISOString(),
    };

    await setDoc(docRef, {
      ...novaTatica,
      criadoEmServer: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    return novaTatica;
  },

  /**
   * Listar táticas salvas da equipe (opcionalmente filtradas por modalidade)
   */
  async getTacticsByTeam(timeId: string, modalidade?: ModalityId): Promise<Tactic[]> {
    let q = query(
      collection(db, COLLECTIONS.TATICAS),
      where('timeId', '==', timeId)
    );

    const querySnapshot = await getDocs(q);
    let tactics = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Tactic[];

    if (modalidade) {
      tactics = tactics.filter(t => t.modalidade === modalidade);
    }

    return tactics.sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());
  },

  /**
   * Buscar tática por ID
   */
  async getTacticById(tacticId: string): Promise<Tactic | null> {
    const docRef = doc(db, COLLECTIONS.TATICAS, tacticId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Tactic;
  },

  /**
   * Atualizar tática
   */
  async updateTactic(tacticId: string, updates: Partial<CreateTacticDTO>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TATICAS, tacticId);
    await updateDoc(docRef, {
      ...updates,
      atualizadoEm: serverTimestamp(),
    });
  },

  /**
   * Remover tática
   */
  async deleteTactic(tacticId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TATICAS, tacticId);
    await deleteDoc(docRef);
  },
};

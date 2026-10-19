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
import { Training, TrainingFocus } from '../../../types';

/**
 * SERVIÇO DE GESTÃO DE TREINAMENTOS (CRUD TREINOS)
 * Requisitos: RF11
 */

export interface CreateTrainingDTO {
  titulo: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  local: string;
  foco: TrainingFocus;
  descricao?: string;
}

export const trainingService = {
  /**
   * RF11: Cadastrar novo treino para a equipe
   */
  async createTraining(timeId: string, data: CreateTrainingDTO): Promise<Training> {
    if (!timeId) {
      throw new Error('O ID da equipe é obrigatório para agendar o treino.');
    }
    if (!data.titulo?.trim()) {
      throw new Error('O título do treinamento é obrigatório.');
    }
    if (!data.data || !data.horario) {
      throw new Error('Data e horário do treino são obrigatórios.');
    }

    const trainingDocRef = doc(collection(db, COLLECTIONS.TREINOS));
    const trainingId = trainingDocRef.id;

    const novoTreino: Training = {
      id: trainingId,
      timeId,
      titulo: data.titulo.trim(),
      data: data.data,
      horario: data.horario,
      local: data.local?.trim() || 'Centro de Treinamento',
      foco: data.foco || 'tatico',
      descricao: data.descricao?.trim() || undefined,
    };

    await setDoc(trainingDocRef, {
      ...novoTreino,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    return novoTreino;
  },

  /**
   * RF11: Listar treinamentos de uma equipe
   */
  async getTrainingsByTeam(timeId: string): Promise<Training[]> {
    const q = query(
      collection(db, COLLECTIONS.TREINOS),
      where('timeId', '==', timeId)
    );
    const querySnapshot = await getDocs(q);

    const trainings = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Training[];

    return trainings.sort((a, b) => {
      const dateA = new Date(`${a.data}T${a.horario}`).getTime();
      const dateB = new Date(`${b.data}T${b.horario}`).getTime();
      return dateB - dateA;
    });
  },

  /**
   * Obter treino por ID
   */
  async getTrainingById(trainingId: string): Promise<Training | null> {
    const docRef = doc(db, COLLECTIONS.TREINOS, trainingId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Training;
  },

  /**
   * Atualizar treino
   */
  async updateTraining(trainingId: string, updates: Partial<CreateTrainingDTO>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TREINOS, trainingId);
    await updateDoc(docRef, {
      ...updates,
      atualizadoEm: serverTimestamp(),
    });
  },

  /**
   * Remover treino
   */
  async deleteTraining(trainingId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.TREINOS, trainingId);
    await deleteDoc(docRef);
  },
};

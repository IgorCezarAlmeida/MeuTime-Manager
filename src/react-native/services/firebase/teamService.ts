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
import { Team, SportId, ModalityId, TeamColors } from '../../../types';

/**
 * SERVIÇO DE GESTÃO DA EQUIPE (CRUD TIME)
 * Requisitos: RF03, RF04, RF09
 * Regras de Negócio: RN01, RN02, RN06
 * Casos de Uso: UC01 (Criar equipe)
 */

export interface CreateTeamDTO {
  nome: string;
  esporte: SportId;
  modalidade: ModalityId;
  escudoUrl?: string;
  cidade?: string;
  fundacao?: string;
  cores?: TeamColors;
}

export const teamService = {
  /**
   * UC01 / RF03 / RF04: Criar equipe esportiva
   * Define o técnico responsável (RN01) e configura esporte/modalidade (RN02).
   */
  async createTeam(
    tecnicoUid: string,
    tecnicoNome: string,
    data: CreateTeamDTO
  ): Promise<Team> {
    if (!tecnicoUid) {
      throw new Error('RN01: Uma equipe precisa obrigatoriamente de um técnico responsável.');
    }
    if (!data.nome?.trim()) {
      throw new Error('O nome da equipe é obrigatório.');
    }
    if (!data.esporte || !data.modalidade) {
      throw new Error('RN02: Uma equipe deve possuir um esporte e uma modalidade definidos.');
    }

    // Gera ID único para o time
    const teamDocRef = doc(collection(db, COLLECTIONS.TIMES));
    const teamId = teamDocRef.id;

    // Gera código de convite amigável de 6 caracteres (letras maiúsculas e números)
    const codigoConvite = Math.random().toString(36).substring(2, 8).toUpperCase();

    const novoTime: Team = {
      id: teamId,
      nome: data.nome.trim(),
      esporte: data.esporte,
      modalidade: data.modalidade,
      escudoUrl: data.escudoUrl,
      tecnicoUid,
      tecnicoNome,
      codigoConvite,
      cidade: data.cidade?.trim() || 'Brasil',
      fundacao: data.fundacao || new Date().getFullYear().toString(),
      cores: data.cores || {
        primary: '#2563eb',
        secondary: '#0f172a',
        text: '#ffffff',
      },
    };

    await setDoc(teamDocRef, {
      ...novoTime,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    // Atualiza o documento do técnico para vincular o time ativo
    const userDocRef = doc(db, COLLECTIONS.USUARIOS, tecnicoUid);
    await updateDoc(userDocRef, {
      timeVinculadoId: teamId,
      atualizadoEm: serverTimestamp(),
    });

    return novoTime;
  },

  /**
   * Buscar dados de uma equipe pelo ID
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    const teamDocRef = doc(db, COLLECTIONS.TIMES, teamId);
    const snapshot = await getDoc(teamDocRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Team;
  },

  /**
   * RF09 / UC03: Localizar equipe através do Código de Convite
   */
  async getTeamByInviteCode(codigoConvite: string): Promise<Team | null> {
    const q = query(
      collection(db, COLLECTIONS.TIMES),
      where('codigoConvite', '==', codigoConvite.trim().toUpperCase())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const firstDoc = querySnapshot.docs[0];
    return { id: firstDoc.id, ...firstDoc.data() } as Team;
  },

  /**
   * Listar equipes gerenciadas por um técnico
   */
  async listTeamsByCoach(tecnicoUid: string): Promise<Team[]> {
    const q = query(
      collection(db, COLLECTIONS.TIMES),
      where('tecnicoUid', '==', tecnicoUid)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Team[];
  },

  /**
   * RN06: Somente o técnico responsável pode alterar informações da equipe
   */
  async updateTeam(
    teamId: string,
    solicitanteUid: string,
    updates: Partial<Omit<Team, 'id' | 'tecnicoUid' | 'codigoConvite'>>
  ): Promise<void> {
    const currentTeam = await this.getTeamById(teamId);
    if (!currentTeam) {
      throw new Error('Equipe não encontrada.');
    }

    if (currentTeam.tecnicoUid !== solicitanteUid) {
      throw new Error('RN06: Somente o técnico responsável pode alterar informações da equipe.');
    }

    const teamDocRef = doc(db, COLLECTIONS.TIMES, teamId);
    await updateDoc(teamDocRef, {
      ...updates,
      atualizadoEm: serverTimestamp(),
    });
  },

  /**
   * Remover equipe (Apenas técnico responsável)
   */
  async deleteTeam(teamId: string, solicitanteUid: string): Promise<void> {
    const currentTeam = await this.getTeamById(teamId);
    if (!currentTeam) {
      throw new Error('Equipe não encontrada.');
    }

    if (currentTeam.tecnicoUid !== solicitanteUid) {
      throw new Error('RN06: Somente o técnico responsável pode remover a equipe.');
    }

    const teamDocRef = doc(db, COLLECTIONS.TIMES, teamId);
    await deleteDoc(teamDocRef);
  },
};

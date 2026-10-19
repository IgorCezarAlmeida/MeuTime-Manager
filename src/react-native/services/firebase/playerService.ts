import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import { Player, PlayerStatus, DominantSide, PlayerStats } from '../../../types';

/**
 * SERVIÇO DE GESTÃO DO ELENCO / JOGADORES (CRUD JOGADORES)
 * Requisitos: RF05, RF06, RF08, RNF09
 * Regras de Negócio: RN03, RN04, RN05, RN11, RN12
 * Casos de Uso: UC02 (Cadastrar jogador), UC03 (Vincular conta)
 */

export interface CreatePlayerDTO {
  nome: string;
  apelido?: string;
  numero: number;
  posicao: string;
  posicaoSecundaria?: string;
  peDominante?: DominantSide;
  status?: PlayerStatus;
  telefone?: string;
  usuarioUid?: string;
}

export const playerService = {
  /**
   * UC02 / RF05 / RN03: Cadastro manual de jogador no elenco pelo técnico
   * Valida RN05: Não permitir 2 cadastros com o mesmo número ativo no mesmo time.
   */
  async addPlayer(timeId: string, data: CreatePlayerDTO): Promise<Player> {
    if (!timeId) {
      throw new Error('O ID da equipe é obrigatório para cadastrar um jogador.');
    }
    if (!data.nome?.trim()) {
      throw new Error('O nome do jogador é obrigatório.');
    }
    if (data.numero === undefined || data.numero === null || isNaN(data.numero)) {
      throw new Error('O número da camisa é obrigatório.');
    }

    // RN05 & RNF09: Verificar duplicidade de número ativo no mesmo time
    const existingPlayers = await this.getPlayersByTeam(timeId, false);
    const hasDuplicateNumber = existingPlayers.some(
      p => p.numero === Number(data.numero) && p.status !== ('inativo' as PlayerStatus)
    );

    if (hasDuplicateNumber) {
      throw new Error(
        `RN05: Já existe um jogador ativo com a camisa nº ${data.numero} nesta equipe.`
      );
    }

    const playerDocRef = doc(collection(db, COLLECTIONS.JOGADORES));
    const playerId = playerDocRef.id;

    const initialStats: PlayerStats = {
      jogos: 0,
      gols: 0,
      assistencias: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0,
      presencaPct: 100,
    };

    const novoJogador: Player = {
      id: playerId,
      timeId,
      usuarioUid: data.usuarioUid || undefined,
      nome: data.nome.trim(),
      apelido: data.apelido?.trim() || undefined,
      numero: Number(data.numero),
      posicao: data.posicao,
      posicaoSecundaria: data.posicaoSecundaria || undefined,
      peDominante: data.peDominante || 'Destro',
      status: data.status || 'ativo',
      telefone: data.telefone?.trim() || undefined,
      estatisticas: initialStats,
      criadoEm: new Date().toISOString(),
    };

    await setDoc(playerDocRef, {
      ...novoJogador,
      criadoEmServer: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    return novoJogador;
  },

  /**
   * RF05: Listar jogadores do elenco de uma equipe
   * @param includeInactive Se true, inclui atletas marcados como inativos (RN11)
   */
  async getPlayersByTeam(timeId: string, includeInactive: boolean = false): Promise<Player[]> {
    const q = query(
      collection(db, COLLECTIONS.JOGADORES),
      where('timeId', '==', timeId)
    );
    const querySnapshot = await getDocs(q);

    let players = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Player[];

    if (!includeInactive) {
      players = players.filter(p => (p.status as string) !== 'inativo');
    }

    // Ordena por número da camisa crescente
    return players.sort((a, b) => a.numero - b.numero);
  },

  /**
   * Buscar jogador por ID
   */
  async getPlayerById(playerId: string): Promise<Player | null> {
    const docRef = doc(db, COLLECTIONS.JOGADORES, playerId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Player;
  },

  /**
   * RF06: Editar dados de um jogador
   * Valida RN05 se o número for modificado.
   */
  async updatePlayer(playerId: string, updates: Partial<CreatePlayerDTO>): Promise<void> {
    const currentPlayer = await this.getPlayerById(playerId);
    if (!currentPlayer) {
      throw new Error('Jogador não encontrado.');
    }

    // Se o número estiver sendo alterado, verifica se não colide com outro atleta
    if (updates.numero !== undefined && updates.numero !== currentPlayer.numero) {
      const teamPlayers = await this.getPlayersByTeam(currentPlayer.timeId, false);
      const isDuplicate = teamPlayers.some(
        p => p.id !== playerId && p.numero === Number(updates.numero) && (p.status as string) !== 'inativo'
      );
      if (isDuplicate) {
        throw new Error(`RN05: A camisa nº ${updates.numero} já está em uso por outro atleta do elenco.`);
      }
    }

    const docRef = doc(db, COLLECTIONS.JOGADORES, playerId);
    await updateDoc(docRef, {
      ...updates,
      atualizadoEm: serverTimestamp(),
    });
  },

  /**
   * RF06 & RN11: Remover jogador do elenco
   * "Jogadores removidos do elenco não deverão ter seu histórico esportivo apagado automaticamente."
   * Realiza Soft Delete alterando status para 'inativo'.
   */
  async removePlayer(playerId: string, permanentDelete: boolean = false): Promise<void> {
    const docRef = doc(db, COLLECTIONS.JOGADORES, playerId);

    if (permanentDelete) {
      // Exclusão física somente caso não possua histórico
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(docRef);
    } else {
      // RN11: Preserva o histórico esportivo (partidas, gols, súmulas)
      await updateDoc(docRef, {
        status: 'inativo',
        removidoEm: serverTimestamp(),
      });
    }
  },

  /**
   * UC03 / RF08 / RN04: Vincular conta de usuário de jogador a um perfil esportivo existente
   */
  async linkAccountToPlayer(playerId: string, userUid: string): Promise<void> {
    const player = await this.getPlayerById(playerId);
    if (!player) {
      throw new Error('Jogador não encontrado.');
    }

    const playerDocRef = doc(db, COLLECTIONS.JOGADORES, playerId);
    await updateDoc(playerDocRef, {
      usuarioUid: userUid,
      atualizadoEm: serverTimestamp(),
    });

    // Atualiza o documento de usuários
    const userDocRef = doc(db, COLLECTIONS.USUARIOS, userUid);
    await updateDoc(userDocRef, {
      timeVinculadoId: player.timeId,
      jogadorVinculadoId: playerId,
      atualizadoEm: serverTimestamp(),
    });
  },

  /**
   * Atualizar estatísticas do jogador (após partidas registradas RF20, RF22)
   */
  async updatePlayerStats(playerId: string, statsUpdate: Partial<PlayerStats>): Promise<void> {
    const player = await this.getPlayerById(playerId);
    if (!player) return;

    const newStats: PlayerStats = {
      jogos: (player.estatisticas?.jogos || 0) + (statsUpdate.jogos || 0),
      gols: (player.estatisticas?.gols || 0) + (statsUpdate.gols || 0),
      assistencias: (player.estatisticas?.assistencias || 0) + (statsUpdate.assistencias || 0),
      cartoesAmarelos: (player.estatisticas?.cartoesAmarelos || 0) + (statsUpdate.cartoesAmarelos || 0),
      cartoesVermelhos: (player.estatisticas?.cartoesVermelhos || 0) + (statsUpdate.cartoesVermelhos || 0),
      presencaPct: statsUpdate.presencaPct !== undefined ? statsUpdate.presencaPct : (player.estatisticas?.presencaPct || 100),
    };

    const docRef = doc(db, COLLECTIONS.JOGADORES, playerId);
    await updateDoc(docRef, {
      estatisticas: newStats,
      atualizadoEm: serverTimestamp(),
    });
  },
};

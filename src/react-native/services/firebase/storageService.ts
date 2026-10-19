import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * SERVIÇO DE ARMAZENAMENTO DE ARQUIVOS (FIREBASE CLOUD STORAGE)
 * Responsável por escudos de times e fotos de jogadores (Seção 14)
 */

export const storageService = {
  /**
   * Upload de escudo do time
   * @param teamId ID do time
   * @param blobOrFile Arquivo Blob ou File (compatível com React Native via fetch(uri).then(r => r.blob()))
   */
  async uploadTeamShield(teamId: string, blobOrFile: Blob | Uint8Array | ArrayBuffer): Promise<string> {
    const shieldRef = ref(storage, `escudos/${teamId}/shield_${Date.now()}.png`);
    await uploadBytes(shieldRef, blobOrFile);
    const downloadUrl = await getDownloadURL(shieldRef);
    return downloadUrl;
  },

  /**
   * Upload de foto do jogador
   */
  async uploadPlayerPhoto(playerId: string, blobOrFile: Blob | Uint8Array | ArrayBuffer): Promise<string> {
    const photoRef = ref(storage, `jogadores/${playerId}/photo_${Date.now()}.png`);
    await uploadBytes(photoRef, blobOrFile);
    const downloadUrl = await getDownloadURL(photoRef);
    return downloadUrl;
  },
};

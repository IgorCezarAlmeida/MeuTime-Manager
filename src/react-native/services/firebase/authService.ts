import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, COLLECTIONS } from './config';
import { AppUser, UserRole } from '../../../types';

/**
 * SERVIÇO DE AUTENTICAÇÃO E GESTÃO DE USUÁRIOS (RF01, RF02, RNF03)
 * Plataforma: React Native (Android) + Firebase Authentication & Cloud Firestore
 */

export interface SignUpDTO {
  email: string;
  senha: string;
  nome: string;
  role: UserRole;
  fotoUrl?: string;
  timeVinculadoId?: string;
  jogadorVinculadoId?: string;
}

export const authService = {
  /**
   * RF01: Cadastro de usuário (Técnico ou Jogador)
   * Cria conta no Firebase Auth e persiste o documento em `usuarios/{uid}`
   */
  async signUp({ email, senha, nome, role, fotoUrl, timeVinculadoId, jogadorVinculadoId }: SignUpDTO): Promise<AppUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), senha);
    const firebaseUser: FirebaseUser = userCredential.user;

    // Atualiza nome de exibição no Firebase Auth
    if (nome) {
      await updateProfile(firebaseUser, { displayName: nome });
    }

    const newUserDoc: AppUser = {
      uid: firebaseUser.uid,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      role,
      fotoUrl: fotoUrl || undefined,
      timeVinculadoId: timeVinculadoId || undefined,
      jogadorVinculadoId: jogadorVinculadoId || undefined,
    };

    // Grava perfil no Firestore em `usuarios/{uid}`
    const userDocRef = doc(db, COLLECTIONS.USUARIOS, firebaseUser.uid);
    await setDoc(userDocRef, {
      ...newUserDoc,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });

    return newUserDoc;
  },

  /**
   * RF02: Login / Autenticação
   */
  async signIn(email: string, senha: string): Promise<AppUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), senha);
    const firebaseUser = userCredential.user;

    const profile = await this.getUserProfile(firebaseUser.uid);
    if (!profile) {
      // Fallback caso o documento ainda não exista
      const fallbackUser: AppUser = {
        uid: firebaseUser.uid,
        nome: firebaseUser.displayName || 'Usuário',
        email: firebaseUser.email || email,
        role: 'tecnico',
      };
      await setDoc(doc(db, COLLECTIONS.USUARIOS, firebaseUser.uid), fallbackUser);
      return fallbackUser;
    }

    return profile;
  },

  /**
   * RF02: Logout
   */
  async signOutUser(): Promise<void> {
    await signOut(auth);
  },

  /**
   * RF02 / MVP: Recuperação de senha por e-mail
   */
  async recoverPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  /**
   * Consulta dados do perfil de usuário em `usuarios/{uid}`
   */
  async getUserProfile(uid: string): Promise<AppUser | null> {
    const userDocRef = doc(db, COLLECTIONS.USUARIOS, uid);
    const snapshot = await getDoc(userDocRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      uid: snapshot.id,
      nome: data.nome,
      email: data.email,
      role: data.role as UserRole,
      fotoUrl: data.fotoUrl,
      timeVinculadoId: data.timeVinculadoId,
      jogadorVinculadoId: data.jogadorVinculadoId,
    };
  },

  /**
   * Atualização do perfil
   */
  async updateUserProfile(uid: string, updates: Partial<Omit<AppUser, 'uid' | 'email'>>): Promise<void> {
    const userDocRef = doc(db, COLLECTIONS.USUARIOS, uid);
    await updateDoc(userDocRef, {
      ...updates,
      atualizadoEm: serverTimestamp(),
    });
  },

  /**
   * UC03 / RF08: Vincula a conta do jogador logado ao time e ao registro esportivo no elenco
   */
  async linkPlayerToTeam(userUid: string, teamId: string, jogadorId: string): Promise<void> {
    const userDocRef = doc(db, COLLECTIONS.USUARIOS, userUid);
    await updateDoc(userDocRef, {
      timeVinculadoId: teamId,
      jogadorVinculadoId: jogadorId,
      atualizadoEm: serverTimestamp(),
    });

    // Atualiza também o documento do jogador em `jogadores/{jogadorId}`
    const playerDocRef = doc(db, COLLECTIONS.JOGADORES, jogadorId);
    await updateDoc(playerDocRef, {
      usuarioUid: userUid,
      atualizadoEm: serverTimestamp(),
    });
  },
};

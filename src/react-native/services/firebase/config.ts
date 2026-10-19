import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase para React Native / Android
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSy_MOCK_API_KEY_MEUTIME',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'meutime-manager.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'meutime-manager',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'meutime-manager.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:android:abcdef1234567890',
};

// Inicialização segura Singleton
const isFirstInit = getApps().length === 0;
export const firebaseApp = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// Auth com persistência via AsyncStorage (obrigatório para React Native)
// initializeAuth só pode ser chamado na primeira inicialização
export const auth = isFirstInit
  ? initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(firebaseApp);

export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Nomes padronizados das coleções conforme a Seção 15 do Documento de Engenharia de Software
export const COLLECTIONS = {
  USUARIOS: 'usuarios',
  TIMES: 'times',
  JOGADORES: 'jogadores',
  PARTIDAS: 'partidas',
  TREINOS: 'treinos',
  ESCALACOES: 'escalacoes',
  TATICAS: 'taticas',
  PRESENCAS: 'presencas',
} as const;

// Coleções tipadas para Firestore
export const usuariosRef = collection(db, COLLECTIONS.USUARIOS);
export const timesRef = collection(db, COLLECTIONS.TIMES);
export const jogadoresRef = collection(db, COLLECTIONS.JOGADORES);
export const partidasRef = collection(db, COLLECTIONS.PARTIDAS);
export const treinosRef = collection(db, COLLECTIONS.TREINOS);
export const escalacoesRef = collection(db, COLLECTIONS.ESCALACOES);
export const taticasRef = collection(db, COLLECTIONS.TATICAS);
export const presencasRef = collection(db, COLLECTIONS.PRESENCAS);

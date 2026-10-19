import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase/config';
import { authService, SignUpDTO } from '../services/firebase/authService';
import { AppUser } from '../../types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const profile = await authService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
          } else {
            setCurrentUser({
              uid: firebaseUser.uid,
              nome: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email || '',
              role: 'tecnico',
            });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err: any) {
        console.error('Erro ao escutar estado de autenticação:', err);
        setError(err.message || 'Erro ao sincronizar sessão.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.signIn(email, pass);
      setCurrentUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || 'Falha ao realizar login.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (dto: SignUpDTO) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authService.signUp(dto);
      setCurrentUser(newUser);
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar usuário.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOutUser();
      setCurrentUser(null);
    } catch (err: any) {
      setError(err.message || 'Falha ao sair.');
    } finally {
      setLoading(false);
    }
  }, []);

  const recoverPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.recoverPassword(email);
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar e-mail de recuperação.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const updated = await authService.getUserProfile(currentUser.uid);
      if (updated) {
        setCurrentUser(updated);
      }
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
    }
  }, [currentUser?.uid]);

  return {
    currentUser,
    setCurrentUser,
    isAuthenticated: !!currentUser,
    isCoach: currentUser?.role === 'tecnico',
    isPlayer: currentUser?.role === 'jogador',
    loading,
    error,
    login,
    register,
    logout,
    recoverPassword,
    refreshProfile,
  };
}

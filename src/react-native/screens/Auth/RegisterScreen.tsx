import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { UserRole } from '../../../types';
import { SignUpDTO } from '../../services/firebase/authService';

interface RegisterScreenProps {
  onRegister: (dto: SignUpDTO) => Promise<any>;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onNavigateToLogin,
}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [role, setRole] = useState<UserRole>('tecnico');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nome.trim() || !email.trim() || !senha) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirmSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onRegister({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        role,
      });
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Criar Conta no MeuTime</Text>
          <Text style={styles.cardSubtitle}>
            Cadastre-se para gerenciar ou participar da equipe
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          {/* Seleção do Perfil / Papel (Técnico vs Jogador - Seção 6) */}
          <Text style={styles.label}>Você é:</Text>
          <View style={styles.roleSelector}>
            <TouchableOpacity
              onPress={() => setRole('tecnico')}
              style={[
                styles.roleOption,
                role === 'tecnico' ? styles.roleOptionActive : null,
              ]}
            >
              <Text style={styles.roleIcon}>📋</Text>
              <Text
                style={[
                  styles.roleText,
                  role === 'tecnico' ? styles.roleTextActive : null,
                ]}
              >
                Técnico
              </Text>
              <Text style={styles.roleDesc}>Cria e gerencia times</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole('jogador')}
              style={[
                styles.roleOption,
                role === 'jogador' ? styles.roleOptionActive : null,
              ]}
            >
              <Text style={styles.roleIcon}>🏃</Text>
              <Text
                style={[
                  styles.roleText,
                  role === 'jogador' ? styles.roleTextActive : null,
                ]}
              >
                Jogador
              </Text>
              <Text style={styles.roleDesc}>Confirma presença e joga</Text>
            </TouchableOpacity>
          </View>

          <CustomInput
            label="Nome Completo *"
            placeholder="Ex: Carlos Silva"
            value={nome}
            onChangeText={setNome}
          />

          <CustomInput
            label="E-mail *"
            placeholder="seu.email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <CustomInput
            label="Senha (mín. 6 dígitos) *"
            placeholder="Crie uma senha forte"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <CustomInput
            label="Confirmar Senha *"
            placeholder="Repita sua senha"
            secureTextEntry
            value={confirmSenha}
            onChangeText={setConfirmSenha}
          />

          {role === 'jogador' && (
            <CustomInput
              label="Código de Convite do Time (Opcional)"
              placeholder="Ex: ABC123"
              autoCapitalize="characters"
              value={codigoConvite}
              onChangeText={setCodigoConvite}
            />
          )}

          <CustomButton
            title="Concluir Cadastro"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity onPress={onNavigateToLogin} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Já tem uma conta? <Text style={styles.loginLinkHighlight}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 18,
  },
  errorBox: {
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorBoxText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleOptionActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#172554',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 14,
  },
  roleTextActive: {
    color: '#60a5fa',
  },
  roleDesc: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 18,
  },
  loginLinkText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

interface LoginScreenProps {
  onLogin: (email: string, pass: string) => Promise<any>;
  onNavigateToRegister: () => void;
  onForgotPassword: (email: string) => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onNavigateToRegister,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !senha) {
      setError('Por favor, informe e-mail e senha.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onLogin(email.trim(), senha);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async () => {
    if (!email.trim()) {
      Alert.alert('Recuperar Senha', 'Digite seu e-mail no campo acima para receber as instruções de recuperação.');
      return;
    }
    try {
      await onForgotPassword(email.trim());
      Alert.alert('Sucesso', 'E-mail de recuperação enviado com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao enviar e-mail.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚽🏀</Text>
          </View>
          <Text style={styles.brandTitle}>MeuTime Manager</Text>
          <Text style={styles.brandSubtitle}>
            Gestão de Equipes Esportivas Amadoras
          </Text>
        </View>

        {/* Card de Login */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na Conta</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          )}

          <CustomInput
            label="E-mail"
            placeholder="seu.email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <CustomInput
            label="Senha"
            placeholder="Sua senha secreta"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity onPress={handleRecover} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <CustomButton
            title="Entrar"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: 10 }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomButton
            title="Criar Nova Conta"
            variant="outline"
            onPress={onNavigateToRegister}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748b',
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '700',
  },
});

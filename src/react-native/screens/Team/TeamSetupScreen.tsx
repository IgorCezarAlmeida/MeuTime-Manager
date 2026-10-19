import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { SportId, ModalityId } from '../../../types';
import { SPORTS_LIST, MODALITIES_CONFIG } from '../../../constants/sports';
import { CreateTeamDTO } from '../../services/firebase/teamService';

interface TeamSetupScreenProps {
  isCoach: boolean;
  coachUid: string;
  coachName: string;
  onCreateTeam: (dto: CreateTeamDTO) => Promise<any>;
  onJoinTeamWithInvite: (code: string) => Promise<any>;
}

export const TeamSetupScreen: React.FC<TeamSetupScreenProps> = ({
  isCoach,
  coachUid,
  coachName,
  onCreateTeam,
  onJoinTeamWithInvite,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>(isCoach ? 'create' : 'join');

  // Form de Criação de Time (UC01, RF03, RF04)
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportId>('futebol');
  const [selectedModality, setSelectedModality] = useState<ModalityId>('futebol_campo');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form de Entrada via Convite (RF09, UC03)
  const [inviteCode, setInviteCode] = useState('');

  // Ao mudar de esporte, seleciona a primeira modalidade disponível
  const handleSelectSport = (sportId: SportId) => {
    setSelectedSport(sportId);
    const sportObj = SPORTS_LIST.find(s => s.id === sportId);
    if (sportObj && sportObj.modalities.length > 0) {
      setSelectedModality(sportObj.modalities[0]);
    }
  };

  const handleCreate = async () => {
    if (!nome.trim()) {
      setError('Por favor, informe o nome da sua equipe.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onCreateTeam({
        nome: nome.trim(),
        esporte: selectedSport,
        modalidade: selectedModality,
        cidade: cidade.trim() || undefined,
        cores: {
          primary: primaryColor,
          secondary: '#0f172a',
          text: '#ffffff',
        },
      });
      Alert.alert('Sucesso', 'Equipe criada com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Falha ao criar equipe.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('Informe o código de convite de 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onJoinTeamWithInvite(inviteCode.trim().toUpperCase());
      Alert.alert('Sucesso', 'Você agora faz parte da equipe!');
    } catch (err: any) {
      setError(err.message || 'Código de convite inválido ou equipe não encontrada.');
    } finally {
      setLoading(false);
    }
  };

  const currentSportObj = SPORTS_LIST.find(s => s.id === selectedSport);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Abas Alternativas */}
      <View style={styles.tabContainer}>
        {isCoach && (
          <TouchableOpacity
            onPress={() => {
              setActiveTab('create');
              setError(null);
            }}
            style={[styles.tab, activeTab === 'create' ? styles.tabActive : null]}
          >
            <Text style={[styles.tabText, activeTab === 'create' ? styles.tabTextActive : null]}>
              Criar Equipe (UC01)
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            setActiveTab('join');
            setError(null);
          }}
          style={[styles.tab, activeTab === 'join' ? styles.tabActive : null]}
        >
          <Text style={[styles.tabText, activeTab === 'join' ? styles.tabTextActive : null]}>
            Entrar com Convite
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{error}</Text>
        </View>
      )}

      {activeTab === 'create' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configuração da Equipe</Text>
          <Text style={styles.cardSubtitle}>
            Configure o esporte, modalidade e dados do time
          </Text>

          <CustomInput
            label="Nome da Equipe *"
            placeholder="Ex: Gaviões da Vila F.C."
            value={nome}
            onChangeText={setNome}
          />

          <CustomInput
            label="Cidade / Bairro"
            placeholder="Ex: São Paulo, SP"
            value={cidade}
            onChangeText={setCidade}
          />

          {/* Seleção do Esporte (Seção 10) */}
          <Text style={styles.label}>Esporte Coletivo *</Text>
          <View style={styles.optionsRow}>
            {SPORTS_LIST.map(sport => (
              <TouchableOpacity
                key={sport.id}
                onPress={() => handleSelectSport(sport.id)}
                style={[
                  styles.optionPill,
                  selectedSport === sport.id ? styles.optionPillActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    selectedSport === sport.id ? styles.optionPillTextActive : null,
                  ]}
                >
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Seleção da Modalidade (Seção 10: Campo, Society, Futsal, Basquete 3x3, 5x5) */}
          <Text style={[styles.label, { marginTop: 12 }]}>Modalidade Esportiva *</Text>
          <View style={styles.modalitiesGrid}>
            {currentSportObj?.modalities.map(modId => {
              const modConfig = MODALITIES_CONFIG[modId];
              return (
                <TouchableOpacity
                  key={modId}
                  onPress={() => setSelectedModality(modId)}
                  style={[
                    styles.modalityCard,
                    selectedModality === modId ? styles.modalityCardActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalityName,
                      selectedModality === modId ? styles.modalityNameActive : null,
                    ]}
                  >
                    {modConfig.name}
                  </Text>
                  <Text style={styles.modalityMeta}>
                    {modConfig.maxStarters} em campo/quadra | {modConfig.courtType}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cor Principal do Uniforme */}
          <Text style={[styles.label, { marginTop: 14 }]}>Cor do Uniforme</Text>
          <View style={styles.colorsRow}>
            {['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#0f172a'].map(color => (
              <TouchableOpacity
                key={color}
                onPress={() => setPrimaryColor(color)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  primaryColor === color ? styles.colorCircleSelected : null,
                ]}
              />
            ))}
          </View>

          <CustomButton
            title="Salvar e Criar Equipe"
            onPress={handleCreate}
            loading={loading}
            style={{ marginTop: 20 }}
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar em uma Equipe</Text>
          <Text style={styles.cardSubtitle}>
            Digite o código de convite de 6 caracteres fornecido pelo seu técnico
          </Text>

          <CustomInput
            label="Código de Convite *"
            placeholder="Ex: GAV123"
            autoCapitalize="characters"
            maxLength={6}
            value={inviteCode}
            onChangeText={setInviteCode}
            style={styles.inviteInput}
          />

          <CustomButton
            title="Localizar e Entrar na Equipe"
            onPress={handleJoin}
            loading={loading}
            style={{ marginTop: 12 }}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 20,
    paddingTop: 36,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 16,
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
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionPill: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionPillActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  optionPillText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 13,
  },
  optionPillTextActive: {
    color: '#ffffff',
  },
  modalitiesGrid: {
    gap: 8,
  },
  modalityCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalityCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a',
  },
  modalityName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  modalityNameActive: {
    color: '#60a5fa',
  },
  modalityMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  inviteInput: {
    letterSpacing: 4,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '800',
  },
});

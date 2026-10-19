import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Tactic, ModalityConfig } from '../../../types';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { CreateTacticDTO } from '../../services/firebase/tacticService';

interface TacticsScreenProps {
  isCoach: boolean;
  tactics: Tactic[];
  modalityConfig: ModalityConfig | null;
  onCreateTactic: (dto: CreateTacticDTO) => Promise<any>;
  onDeleteTactic: (tacticId: string) => Promise<any>;
}

export const TacticsScreen: React.FC<TacticsScreenProps> = ({
  isCoach,
  tactics,
  modalityConfig,
  onCreateTactic,
  onDeleteTactic,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [formacao, setFormacao] = useState(modalityConfig?.formations[0]?.name || '4-3-3');
  const [mentalidade, setMentalidade] = useState<'Defensiva' | 'Equilibrada' | 'Ofensiva'>('Equilibrada');
  const [pressao, setPressao] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [instrucaoText, setInstrucaoText] = useState('');
  const [instrucoes, setInstrucoes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddInstruction = () => {
    if (!instrucaoText.trim()) return;
    setInstrucoes(prev => [...prev, instrucaoText.trim()]);
    setInstrucaoText('');
  };

  const handleRemoveInstruction = (index: number) => {
    setInstrucoes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      Alert.alert('Aviso', 'Informe um título para o plano tático.');
      return;
    }
    if (!modalityConfig?.modalityId) {
      Alert.alert('Erro', 'Modalidade esportiva não selecionada.');
      return;
    }

    setLoading(true);
    try {
      await onCreateTactic({
        modalidade: modalityConfig.modalityId,
        titulo: titulo.trim(),
        formacao,
        mentalidade,
        pressao,
        instrucoes,
      });
      setModalVisible(false);
      setTitulo('');
      setInstrucoes([]);
      Alert.alert('Sucesso', 'Tática salva com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao salvar tática.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Prancheta & Táticas (RF15)</Text>
          <Text style={styles.subtitle}>
            Estratégias esportivas para {modalityConfig?.name}
          </Text>
        </View>

        {isCoach && (
          <CustomButton
            title="+ Nova Tática"
            onPress={() => setModalVisible(true)}
            style={styles.addBtn}
          />
        )}
      </View>

      {/* Lista de Táticas Salvas */}
      <FlatList
        data={tactics}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.tacticCard}>
            <View style={styles.cardTop}>
              <Text style={styles.tacticTitle}>{item.titulo}</Text>
              <View style={styles.formationBadge}>
                <Text style={styles.formationBadgeText}>{item.formacao}</Text>
              </View>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.metaTag}>
                <Text style={styles.metaTagLabel}>Mentalidade:</Text>
                <Text style={styles.metaTagVal}>{item.mentalidade}</Text>
              </View>
              <View style={styles.metaTag}>
                <Text style={styles.metaTagLabel}>Pressão:</Text>
                <Text style={styles.metaTagVal}>{item.pressao}</Text>
              </View>
            </View>

            {item.instrucoes && item.instrucoes.length > 0 && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instHeader}>Orientações ao Time:</Text>
                {item.instrucoes.map((ins, i) => (
                  <Text key={i} style={styles.instructionItem}>
                    • {ins}
                  </Text>
                ))}
              </View>
            )}

            {isCoach && (
              <TouchableOpacity
                onPress={() => onDeleteTactic(item.id)}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteText}>Excluir Tática 🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhuma tática criada</Text>
            <Text style={styles.emptySubtitle}>
              {isCoach
                ? 'Crie sua primeira prancheta tática definindo mentalidade, pressão e instruções.'
                : 'Seu técnico ainda não publicou táticas salvas.'}
            </Text>
          </View>
        }
      />

      {/* Modal de Criação de Tática */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.headerModal}>
              <Text style={styles.titleModal}>Criar Tática (RF15)</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <CustomInput
                label="Título da Tática *"
                placeholder="Ex: Marcação Alta e Transição Rápida"
                value={titulo}
                onChangeText={setTitulo}
              />

              {/* Formação */}
              <Text style={styles.label}>Formação Base</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizScroll}>
                {modalityConfig?.formations.map(f => (
                  <TouchableOpacity
                    key={f.name}
                    onPress={() => setFormacao(f.name)}
                    style={[
                      styles.choicePill,
                      formacao === f.name ? styles.choicePillActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choicePillText,
                        formacao === f.name ? styles.choicePillTextActive : null,
                      ]}
                    >
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Mentalidade */}
              <Text style={[styles.label, { marginTop: 12 }]}>Mentalidade da Equipe</Text>
              <View style={styles.rowSelector}>
                {(['Defensiva', 'Equilibrada', 'Ofensiva'] as const).map(m => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMentalidade(m)}
                    style={[
                      styles.selectorBtn,
                      mentalidade === m ? styles.selectorBtnActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectorBtnText,
                        mentalidade === m ? styles.selectorBtnTextActive : null,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Pressão */}
              <Text style={[styles.label, { marginTop: 12 }]}>Pressão / Marcação</Text>
              <View style={styles.rowSelector}>
                {(['Baixa', 'Média', 'Alta'] as const).map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPressao(p)}
                    style={[
                      styles.selectorBtn,
                      pressao === p ? styles.selectorBtnActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectorBtnText,
                        pressao === p ? styles.selectorBtnTextActive : null,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Instruções */}
              <Text style={[styles.label, { marginTop: 14 }]}>Instruções Específicas</Text>
              <View style={styles.instInputRow}>
                <CustomInput
                  placeholder="Ex: Saída de 3 com lateral espetado"
                  value={instrucaoText}
                  onChangeText={setInstrucaoText}
                  containerStyle={{ flex: 1, marginBottom: 0, marginRight: 8 }}
                />
                <CustomButton title="+" onPress={handleAddInstruction} style={{ width: 48 }} />
              </View>

              {instrucoes.map((ins, index) => (
                <View key={index} style={styles.instItemAdded}>
                  <Text style={styles.instItemText}>{ins}</Text>
                  <TouchableOpacity onPress={() => handleRemoveInstruction(index)}>
                    <Text style={styles.instItemRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <CustomButton
                title="Salvar Estratégia Tática"
                onPress={handleSave}
                loading={loading}
                style={{ marginTop: 16, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  addBtn: {
    height: 38,
    paddingHorizontal: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  tacticCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tacticTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  formationBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  formationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTagLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  metaTagVal: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  instructionsContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  instHeader: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructionItem: {
    color: '#94a3b8',
    fontSize: 12,
    marginVertical: 2,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleModal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  closeText: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  horizScroll: {
    flexDirection: 'row',
  },
  choicePill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  choicePillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  choicePillText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  choicePillTextActive: {
    color: '#ffffff',
  },
  rowSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectorBtnActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  selectorBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  selectorBtnTextActive: {
    color: '#60a5fa',
  },
  instInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instItemAdded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  instItemText: {
    color: '#f8fafc',
    fontSize: 13,
    flex: 1,
  },
  instItemRemove: {
    color: '#ef4444',
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '800',
  },
});

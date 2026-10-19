import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { TrainingFocus } from '../../../types';
import { CreateTrainingDTO } from '../../services/firebase/trainingService';

interface TrainingFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveTraining: (dto: CreateTrainingDTO) => Promise<any>;
}

export const TrainingFormModal: React.FC<TrainingFormModalProps> = ({
  visible,
  onClose,
  onSaveTraining,
}) => {
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('19:30');
  const [local, setLocal] = useState('');
  const [foco, setFoco] = useState<TrainingFocus>('tatico');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!titulo.trim()) {
      setError('Informe o título do treinamento.');
      return;
    }
    if (!data.trim() || !horario.trim()) {
      setError('Data e horário são obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSaveTraining({
        titulo: titulo.trim(),
        data: data.trim(),
        horario: horario.trim(),
        local: local.trim() || 'Centro de Treinamento',
        foco,
        descricao: descricao.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao agendar treinamento.');
    } finally {
      setLoading(false);
    }
  };

  const focusOptions: { id: TrainingFocus; label: string }[] = [
    { id: 'tatico', label: 'Tático' },
    { id: 'fisico', label: 'Físico' },
    { id: 'tecnico', label: 'Técnico' },
    { id: 'coletivo', label: 'Coletivo' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Agendar Treinamento (RF11)</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{error}</Text>
              </View>
            )}

            <CustomInput
              label="Título da Sessão *"
              placeholder="Ex: Treino Tático de Posicionamento e Saída de Bola"
              value={titulo}
              onChangeText={setTitulo}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomInput
                  label="Data (AAAA-MM-DD) *"
                  placeholder="2026-10-22"
                  value={data}
                  onChangeText={setData}
                />
              </View>
              <View style={{ width: 110 }}>
                <CustomInput
                  label="Horário (HH:mm) *"
                  placeholder="19:30"
                  value={horario}
                  onChangeText={setHorario}
                />
              </View>
            </View>

            <CustomInput
              label="Local do Treino *"
              placeholder="Ex: Campo Society 1 / Quadra Poliesportiva"
              value={local}
              onChangeText={setLocal}
            />

            <Text style={styles.label}>Foco Principal do Treinamento</Text>
            <View style={styles.focusRow}>
              {focusOptions.map(f => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFoco(f.id)}
                  style={[
                    styles.focusBtn,
                    foco === f.id ? styles.focusBtnActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.focusBtnText,
                      foco === f.id ? styles.focusBtnTextActive : null,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomInput
              label="Descrição e Orientações (Opcional)"
              placeholder="Ex: Aquecimento articular, treino de finalizações e jogo reduzido 5x5."
              multiline
              numberOfLines={3}
              value={descricao}
              onChangeText={setDescricao}
              containerStyle={{ marginTop: 12 }}
            />

            <CustomButton
              title="Agendar Treino"
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: 10, marginBottom: 20 }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#f8fafc',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: '700',
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
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  focusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  focusBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  focusBtnActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  focusBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  focusBtnTextActive: {
    color: '#ffffff',
  },
});

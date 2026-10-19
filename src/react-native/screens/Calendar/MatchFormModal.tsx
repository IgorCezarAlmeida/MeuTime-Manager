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
import { MatchType } from '../../../types';
import { CreateMatchDTO } from '../../services/firebase/matchService';

interface MatchFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveMatch: (dto: CreateMatchDTO) => Promise<any>;
}

export const MatchFormModal: React.FC<MatchFormModalProps> = ({
  visible,
  onClose,
  onSaveMatch,
}) => {
  const [adversario, setAdversario] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('16:00');
  const [local, setLocal] = useState('');
  const [tipo, setTipo] = useState<MatchType>('amistoso');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!adversario.trim()) {
      setError('Informe o nome do time adversário.');
      return;
    }
    if (!data.trim() || !horario.trim()) {
      setError('Data e horário são obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSaveMatch({
        adversario: adversario.trim(),
        data: data.trim(),
        horario: horario.trim(),
        local: local.trim() || 'Campo Principal',
        tipo,
        observacoes: observacoes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao agendar partida.');
    } finally {
      setLoading(false);
    }
  };

  const matchTypes: { id: MatchType; label: string }[] = [
    { id: 'amistoso', label: 'Amistoso' },
    { id: 'campeonato', label: 'Campeonato' },
    { id: 'torneio', label: 'Torneio' },
    { id: 'eliminatoria', label: 'Mata-Mata' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Agendar Nova Partida (RF10)</Text>
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
              label="Nome do Adversário *"
              placeholder="Ex: Real Matismo F.C."
              value={adversario}
              onChangeText={setAdversario}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomInput
                  label="Data (AAAA-MM-DD) *"
                  placeholder="2026-10-25"
                  value={data}
                  onChangeText={setData}
                />
              </View>
              <View style={{ width: 110 }}>
                <CustomInput
                  label="Horário (HH:mm) *"
                  placeholder="16:00"
                  value={horario}
                  onChangeText={setHorario}
                />
              </View>
            </View>

            <CustomInput
              label="Local da Partida *"
              placeholder="Ex: Arena da Vila / Quadra 2"
              value={local}
              onChangeText={setLocal}
            />

            <Text style={styles.label}>Tipo de Jogo</Text>
            <View style={styles.typesRow}>
              {matchTypes.map(t => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTipo(t.id)}
                  style={[
                    styles.typeBtn,
                    tipo === t.id ? styles.typeBtnActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      tipo === t.id ? styles.typeTextActive : null,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomInput
              label="Observações / Avisos (Opcional)"
              placeholder="Ex: Levar uniforme branco, chegar 30min antes"
              value={observacoes}
              onChangeText={setObservacoes}
              containerStyle={{ marginTop: 12 }}
            />

            <CustomButton
              title="Confirmar e Agendar Partida"
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
  typesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeBtnActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  typeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  typeTextActive: {
    color: '#ffffff',
  },
});

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Attendance, AttendanceStatus, Player } from '../../types';
import { CustomButton } from './CustomButton';

interface AttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  eventTitle: string;
  isCoach: boolean;
  attendances: Attendance[];
  playersMap: Record<string, Player>;
  currentPlayerId?: string;
  onConfirmAttendance: (status: AttendanceStatus, justificativa?: string) => Promise<void>;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  visible,
  onClose,
  eventTitle,
  isCoach,
  attendances,
  playersMap,
  currentPlayerId,
  onConfirmAttendance,
}) => {
  const [justificativa, setJustificativa] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status atual do jogador conectado
  const myAttendance = currentPlayerId
    ? attendances.find(a => a.jogadorId === currentPlayerId)
    : undefined;

  const handleSelectStatus = async (status: AttendanceStatus) => {
    setSubmitting(true);
    try {
      await onConfirmAttendance(status, justificativa);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'confirmado':
        return '#16a34a';
      case 'recusado':
        return '#dc2626';
      case 'duvida':
        return '#ca8a04';
      default:
        return '#64748b';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Controle de Presença</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.eventSubtitle}>{eventTitle}</Text>

          {/* Seção do Jogador: Confirmar / Recusar Presença (UC05, RN08) */}
          {!isCoach && (
            <View style={styles.playerSection}>
              <Text style={styles.sectionTitle}>Sua Resposta:</Text>
              {myAttendance && (
                <Text style={styles.currentStatusText}>
                  Status atual:{' '}
                  <Text style={{ color: getStatusColor(myAttendance.status), fontWeight: '700' }}>
                    {myAttendance.status.toUpperCase()}
                  </Text>
                </Text>
              )}

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  disabled={submitting}
                  onPress={() => handleSelectStatus('confirmado')}
                  style={[styles.statusBtn, { backgroundColor: '#16a34a' }]}
                >
                  <Text style={styles.statusBtnText}>✅ Vou</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={submitting}
                  onPress={() => handleSelectStatus('duvida')}
                  style={[styles.statusBtn, { backgroundColor: '#ca8a04' }]}
                >
                  <Text style={styles.statusBtnText}>🤔 Dúvida</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={submitting}
                  onPress={() => handleSelectStatus('recusado')}
                  style={[styles.statusBtn, { backgroundColor: '#dc2626' }]}
                >
                  <Text style={styles.statusBtnText}>❌ Não Vou</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Justificativa (opcional)"
                placeholderTextColor="#64748b"
                value={justificativa}
                onChangeText={setJustificativa}
                style={styles.justInput}
              />
            </View>
          )}

          {/* Seção Geral / Visão do Técnico: Lista de Presenças (RF19) */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
            Lista de Presenças ({attendances.length})
          </Text>

          <FlatList
            data={attendances}
            keyExtractor={item => item.id}
            style={styles.list}
            renderItem={({ item }) => {
              const player = playersMap[item.jogadorId];
              return (
                <View style={styles.attendanceItem}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>
                      {player ? `${player.numero} - ${player.nome}` : item.jogadorId}
                    </Text>
                    {item.justificativa ? (
                      <Text style={styles.itemJust}>"{item.justificativa}"</Text>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: getStatusColor(item.status) },
                    ]}
                  >
                    <Text style={styles.statusPillText}>{item.status}</Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma confirmação registrada ainda.</Text>
            }
          />

          <CustomButton
            title="Fechar"
            variant="secondary"
            onPress={onClose}
            style={{ marginTop: 12 }}
          />
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
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
  eventSubtitle: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  playerSection: {
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  currentStatusText: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statusBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  justInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: '#f8fafc',
    fontSize: 13,
  },
  list: {
    maxHeight: 220,
    marginTop: 6,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  itemLeft: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  itemJust: {
    color: '#94a3b8',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 14,
    fontStyle: 'italic',
  },
});

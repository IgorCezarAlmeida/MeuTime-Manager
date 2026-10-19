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
import { Match, MatchResult, Player } from '../../../types';

interface MatchResultModalProps {
  visible: boolean;
  onClose: () => void;
  match: Match | null;
  players: Player[];
  onSaveResult: (matchId: string, result: MatchResult) => Promise<any>;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({
  visible,
  onClose,
  match,
  players,
  onSaveResult,
}) => {
  const [placarTime, setPlacarTime] = useState(
    match?.resultado?.placarTime?.toString() || '0'
  );
  const [placarAdversario, setPlacarAdversario] = useState(
    match?.resultado?.placarAdversario?.toString() || '0'
  );
  const [destaqueJogadorId, setDestaqueJogadorId] = useState(
    match?.resultado?.destaqueJogadorId || ''
  );
  const [observacaoPosJogo, setObservacaoPosJogo] = useState(
    match?.resultado?.observacaoPosJogo || ''
  );
  const [loading, setLoading] = useState(false);

  if (!match) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result: MatchResult = {
        placarTime: Number(placarTime) || 0,
        placarAdversario: Number(placarAdversario) || 0,
        destaqueJogadorId: destaqueJogadorId || undefined,
        observacaoPosJogo: observacaoPosJogo.trim() || undefined,
      };
      await onSaveResult(match.id, result);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Resultado (RF20)</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.matchSub}>vs {match.adversario}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Placar Oficial */}
            <Text style={styles.label}>Placar Final</Text>
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.teamLabel}>Nosso Time</Text>
                <CustomInput
                  keyboardType="numeric"
                  value={placarTime}
                  onChangeText={setPlacarTime}
                  style={styles.scoreInput}
                />
              </View>

              <Text style={styles.vsText}>X</Text>

              <View style={styles.scoreBox}>
                <Text style={styles.teamLabel}>{match.adversario}</Text>
                <CustomInput
                  keyboardType="numeric"
                  value={placarAdversario}
                  onChangeText={setPlacarAdversario}
                  style={styles.scoreInput}
                />
              </View>
            </View>

            {/* Craque do Jogo / Destaque */}
            <Text style={[styles.label, { marginTop: 12 }]}>Craque do Jogo (MVP)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playersScroll}>
              {players.map(p => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setDestaqueJogadorId(p.id)}
                  style={[
                    styles.playerChip,
                    destaqueJogadorId === p.id ? styles.playerChipActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.playerChipText,
                      destaqueJogadorId === p.id ? styles.playerChipTextActive : null,
                    ]}
                  >
                    #{p.numero} {p.nome.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <CustomInput
              label="Observações Pós-Jogo / Resenha"
              placeholder="Ex: Excelente atuação coletiva, destaque para a defesa..."
              multiline
              numberOfLines={3}
              value={observacaoPosJogo}
              onChangeText={setObservacaoPosJogo}
              containerStyle={{ marginTop: 14 }}
            />

            <CustomButton
              title="Salvar Resultado da Partida"
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: 12, marginBottom: 20 }}
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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  matchSub: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
  },
  teamLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  scoreInput: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    width: 64,
    height: 52,
  },
  vsText: {
    color: '#64748b',
    fontSize: 20,
    fontWeight: '900',
    marginHorizontal: 12,
  },
  playersScroll: {
    flexDirection: 'row',
  },
  playerChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  playerChipActive: {
    backgroundColor: '#16a34a',
    borderColor: '#22c55e',
  },
  playerChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  playerChipTextActive: {
    color: '#ffffff',
  },
});

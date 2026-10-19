import React, { useState, useEffect } from 'react';
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
import { Player, PlayerStatus, DominantSide, ModalityConfig } from '../../../types';
import { CreatePlayerDTO } from '../../services/firebase/playerService';

interface PlayerFormModalProps {
  visible: boolean;
  onClose: () => void;
  playerToEdit?: Player | null;
  modalityConfig: ModalityConfig | null;
  onSavePlayer: (dto: CreatePlayerDTO) => Promise<any>;
}

export const PlayerFormModal: React.FC<PlayerFormModalProps> = ({
  visible,
  onClose,
  playerToEdit,
  modalityConfig,
  onSavePlayer,
}) => {
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [numero, setNumero] = useState('');
  const [posicao, setPosicao] = useState('');
  const [peDominante, setPeDominante] = useState<DominantSide>('Destro');
  const [status, setStatus] = useState<PlayerStatus>('ativo');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playerToEdit) {
      setNome(playerToEdit.nome);
      setApelido(playerToEdit.apelido || '');
      setNumero(playerToEdit.numero.toString());
      setPosicao(playerToEdit.posicao);
      setPeDominante(playerToEdit.peDominante || 'Destro');
      setStatus(playerToEdit.status);
      setTelefone(playerToEdit.telefone || '');
    } else {
      setNome('');
      setApelido('');
      setNumero('');
      setPosicao(modalityConfig?.positions[0]?.name || 'Goleiro');
      setPeDominante('Destro');
      setStatus('ativo');
      setTelefone('');
    }
    setError(null);
  }, [playerToEdit, modalityConfig, visible]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setError('O nome do jogador é obrigatório.');
      return;
    }
    if (!numero.trim() || isNaN(Number(numero))) {
      setError('Informe um número de camisa válido.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSavePlayer({
        nome: nome.trim(),
        apelido: apelido.trim() || undefined,
        numero: Number(numero),
        posicao: posicao || modalityConfig?.positions[0]?.name || 'Goleiro',
        peDominante,
        status,
        telefone: telefone.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar atleta.');
    } finally {
      setLoading(false);
    }
  };

  const positions = modalityConfig?.positions || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {playerToEdit ? 'Editar Atleta' : 'Novo Jogador (UC02)'}
            </Text>
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
              label="Nome Completo *"
              placeholder="Ex: Gabriel Silva"
              value={nome}
              onChangeText={setNome}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomInput
                  label="Apelido"
                  placeholder="Ex: Gabigol"
                  value={apelido}
                  onChangeText={setApelido}
                />
              </View>
              <View style={{ width: 100 }}>
                <CustomInput
                  label="Camisa Nº *"
                  placeholder="10"
                  keyboardType="numeric"
                  value={numero}
                  onChangeText={setNumero}
                />
              </View>
            </View>

            {/* Posição no esporte selecionado */}
            <Text style={styles.label}>Posição no Campo/Quadra *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.posScroll}>
              {positions.map(p => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setPosicao(p.name)}
                  style={[
                    styles.posPill,
                    posicao === p.name ? styles.posPillActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.posPillText,
                      posicao === p.name ? styles.posPillTextActive : null,
                    ]}
                  >
                    {p.shortName} - {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Pé Dominante */}
            <Text style={[styles.label, { marginTop: 14 }]}>Pé/Mão Dominante</Text>
            <View style={styles.rowSelector}>
              {(['Destro', 'Canhoto', 'Ambidestro'] as DominantSide[]).map(side => (
                <TouchableOpacity
                  key={side}
                  onPress={() => setPeDominante(side)}
                  style={[
                    styles.selectorBtn,
                    peDominante === side ? styles.selectorBtnActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectorBtnText,
                      peDominante === side ? styles.selectorBtnTextActive : null,
                    ]}
                  >
                    {side}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status no elenco */}
            <Text style={[styles.label, { marginTop: 14 }]}>Condição / Status</Text>
            <View style={styles.rowSelector}>
              {(['ativo', 'lesionado', 'suspenso'] as PlayerStatus[]).map(st => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setStatus(st)}
                  style={[
                    styles.selectorBtn,
                    status === st ? styles.selectorBtnActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectorBtnText,
                      status === st ? styles.selectorBtnTextActive : null,
                    ]}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomInput
              label="Telefone / WhatsApp"
              placeholder="(11) 98765-4321"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
              containerStyle={{ marginTop: 14 }}
            />

            <CustomButton
              title={playerToEdit ? 'Atualizar Atleta' : 'Cadastrar no Elenco'}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  posScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  posPill: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  posPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  posPillText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  posPillTextActive: {
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
});

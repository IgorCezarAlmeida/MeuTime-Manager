import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { ModalityConfig, TacticalSlot, Player, Team } from '../../../types';
import { SportPitch } from '../../components/SportPitch';
import { CustomButton } from '../../components/CustomButton';

interface LineupScreenProps {
  team: Team;
  modalityConfig: ModalityConfig | null;
  players: Player[];
  isCoach: boolean;
  selectedFormation: string;
  startersSlots: TacticalSlot[];
  benchPlayerIds: string[];
  isPublished: boolean;
  saving: boolean;
  onChangeFormation: (formation: string) => void;
  onAssignStarter: (slotId: string, playerId: string) => void;
  onUnassignStarter: (slotId: string) => void;
  onToggleBench: (playerId: string) => void;
  onSaveLineup: () => Promise<any>;
  onTogglePublish: () => Promise<any>;
}

export const LineupScreen: React.FC<LineupScreenProps> = ({
  team,
  modalityConfig,
  players,
  isCoach,
  selectedFormation,
  startersSlots,
  benchPlayerIds,
  isPublished,
  saving,
  onChangeFormation,
  onAssignStarter,
  onUnassignStarter,
  onToggleBench,
  onSaveLineup,
  onTogglePublish,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TacticalSlot | null>(null);
  const [playerPickerVisible, setPlayerPickerVisible] = useState(false);

  if (!modalityConfig) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Modalidade esportiva não configurada.</Text>
      </View>
    );
  }

  const playersMap = players.reduce<Record<string, Player>>((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const handleSlotPress = (slot: TacticalSlot) => {
    if (!isCoach) {
      // Jogador apenas visualiza
      if (slot.jogadorId) {
        const p = playersMap[slot.jogadorId];
        Alert.alert('Titular', `#${p?.numero} ${p?.nome} (${slot.positionName})`);
      }
      return;
    }
    setSelectedSlot(slot);
    setPlayerPickerVisible(true);
  };

  const handleSelectPlayerForSlot = (playerId: string) => {
    if (!selectedSlot) return;
    onAssignStarter(selectedSlot.slotId, playerId);
    setPlayerPickerVisible(false);
    setSelectedSlot(null);
  };

  const handleClearSlot = () => {
    if (!selectedSlot) return;
    onUnassignStarter(selectedSlot.slotId);
    setPlayerPickerVisible(false);
    setSelectedSlot(null);
  };

  const handleShare = async () => {
    try {
      const titularesList = startersSlots
        .map(s => {
          const p = s.jogadorId ? playersMap[s.jogadorId] : null;
          return `${s.positionName}: ${p ? `#${p.numero} ${p.nome}` : 'A definir'}`;
        })
        .join('\n');

      const reservasText = benchPlayerIds
        .map(id => {
          const p = playersMap[id];
          return p ? `#${p.numero} ${p.nome}` : '';
        })
        .filter(Boolean)
        .join(', ');

      const message = `📋 ESCALAÇÃO OFICIAL: ${team.nome}\nModalidade: ${modalityConfig.name} (${selectedFormation})\n\nTITULARES:\n${titularesList}\n\nBANCO DE RESERVAS:\n${reservasText || 'Nenhum'}`;

      await Share.share({ message });
    } catch (err) {
      console.error(err);
    }
  };

  const assignedStarterIds = new Set(
    startersSlots.map(s => s.jogadorId).filter(Boolean)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header com Informações da Escalação */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Escalação Tática (UC04)</Text>
          <Text style={styles.meta}>
            {team.nome} • {modalityConfig.name}
          </Text>
        </View>

        <View style={styles.headerBadges}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: isPublished ? '#14532d' : '#78350f' },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: isPublished ? '#4ade80' : '#fbbf24' },
              ]}
            >
              {isPublished ? 'PUBLICADA (RF16)' : 'RASCUNHO'}
            </Text>
          </View>
        </View>
      </View>

      {/* Seletor de Formações Esportivas (RF13: 4-3-3, 3-1, 1-2-2, etc.) */}
      {isCoach && (
        <View style={styles.formationSection}>
          <Text style={styles.sectionLabel}>Formação da Modalidade (RF13):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formationScroll}>
            {modalityConfig.formations.map(f => (
              <TouchableOpacity
                key={f.name}
                onPress={() => onChangeFormation(f.name)}
                style={[
                  styles.formationChip,
                  selectedFormation === f.name ? styles.formationChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.formationChipText,
                    selectedFormation === f.name ? styles.formationChipTextActive : null,
                  ]}
                >
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Campo ou Quadra Interativa Adaptada (RF14, RN15) */}
      <SportPitch
        modalityConfig={modalityConfig}
        slots={startersSlots}
        playersMap={playersMap}
        onSlotPress={handleSlotPress}
        selectedSlotId={selectedSlot?.slotId}
      />

      {/* Banco de Reservas */}
      <View style={styles.benchSection}>
        <Text style={styles.sectionLabel}>
          Banco de Reservas ({benchPlayerIds.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.benchScroll}>
          {benchPlayerIds.map(id => {
            const player = playersMap[id];
            if (!player) return null;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => isCoach && onToggleBench(id)}
                style={styles.benchItem}
              >
                <View style={styles.benchNumberCircle}>
                  <Text style={styles.benchNumberText}>{player.numero}</Text>
                </View>
                <Text style={styles.benchPlayerName} numberOfLines={1}>
                  {player.apelido || player.nome.split(' ')[0]}
                </Text>
                {isCoach && <Text style={styles.benchRemoveIcon}>✕</Text>}
              </TouchableOpacity>
            );
          })}
          {benchPlayerIds.length === 0 && (
            <Text style={styles.benchEmptyText}>Nenhum reserva selecionado no banco.</Text>
          )}
        </ScrollView>
      </View>

      {/* Seção para Técnico Adicionar Reservas */}
      {isCoach && (
        <View style={styles.availableSection}>
          <Text style={styles.sectionLabel}>Elenco Disponível para o Banco:</Text>
          <View style={styles.availableList}>
            {players
              .filter(p => !assignedStarterIds.has(p.id) && !benchPlayerIds.includes(p.id))
              .map(player => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => onToggleBench(player.id)}
                  style={styles.addBenchChip}
                >
                  <Text style={styles.addBenchText}>
                    + #{player.numero} {player.nome.split(' ')[0]} ({player.posicao})
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}

      {/* Botões de Ação na Base */}
      {isCoach && (
        <View style={styles.actionsBar}>
          <CustomButton
            title={saving ? 'Salvando...' : 'Salvar Escalação'}
            onPress={async () => {
              try {
                await onSaveLineup();
                Alert.alert('Sucesso', 'Escalação salva com sucesso no Firestore!');
              } catch (err: any) {
                Alert.alert('Erro', err.message || 'Falha ao salvar escalação.');
              }
            }}
            loading={saving}
            style={{ flex: 1, marginRight: 8 }}
          />

          <CustomButton
            title={isPublished ? 'Despublicar' : 'Publicar (RF16)'}
            variant={isPublished ? 'secondary' : 'success'}
            onPress={onTogglePublish}
            style={{ flex: 1 }}
          />
        </View>
      )}

      <CustomButton
        title="Compartilhar Escalação 📲 (RF23)"
        variant="outline"
        onPress={handleShare}
        style={{ marginTop: 10, marginBottom: 30 }}
      />

      {/* Modal Picker para Selecionar Jogador Titular no Slot Clicado */}
      <Modal visible={playerPickerVisible} transparent animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                Escalar para: {selectedSlot?.positionName}
              </Text>
              <TouchableOpacity onPress={() => setPlayerPickerVisible(false)}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {players.map(player => {
                const isAlreadyStarter = assignedStarterIds.has(player.id);
                return (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => handleSelectPlayerForSlot(player.id)}
                    style={styles.pickerPlayerRow}
                  >
                    <View style={styles.pickerNumber}>
                      <Text style={styles.pickerNumberText}>{player.numero}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerPlayerName}>{player.nome}</Text>
                      <Text style={styles.pickerPlayerPos}>
                        {player.posicao} • {player.status}
                      </Text>
                    </View>
                    {isAlreadyStarter && (
                      <Text style={styles.alreadyStarterBadge}>Já titular</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {selectedSlot?.jogadorId && (
              <CustomButton
                title="Desescalar / Deixar Slot Vazio"
                variant="danger"
                onPress={handleClearSlot}
                style={{ marginTop: 10 }}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  meta: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  headerBadges: {
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  formationSection: {
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  formationScroll: {
    flexDirection: 'row',
  },
  formationChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  formationChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  formationChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  formationChipTextActive: {
    color: '#ffffff',
  },
  benchSection: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  benchScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  benchItem: {
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },
  benchNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  benchNumberText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  benchPlayerName: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 4,
    maxWidth: 55,
    textAlign: 'center',
  },
  benchRemoveIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '900',
  },
  benchEmptyText: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  availableSection: {
    marginTop: 12,
  },
  availableList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  addBenchChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  addBenchText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    marginTop: 14,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  pickerClose: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: '700',
  },
  pickerPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  pickerNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pickerNumberText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  pickerPlayerName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  pickerPlayerPos: {
    color: '#94a3b8',
    fontSize: 12,
  },
  alreadyStarterBadge: {
    color: '#eab308',
    fontSize: 11,
    fontWeight: '700',
  },
});

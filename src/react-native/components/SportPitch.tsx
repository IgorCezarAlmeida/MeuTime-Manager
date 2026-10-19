import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { TacticalSlot, ModalityConfig, Player } from '../../types';

interface SportPitchProps {
  modalityConfig: ModalityConfig;
  slots: TacticalSlot[];
  playersMap: Record<string, Player>;
  onSlotPress: (slot: TacticalSlot) => void;
  selectedSlotId?: string | null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const PITCH_HEIGHT = 440;

export const SportPitch: React.FC<SportPitchProps> = ({
  modalityConfig,
  slots,
  playersMap,
  onSlotPress,
  selectedSlotId,
}) => {
  const { courtType, sportId } = modalityConfig;

  // Cores dinâmicas do piso conforme o esporte e modalidade
  const getPitchStyle = () => {
    switch (courtType) {
      case 'grama':
        return { backgroundColor: '#15803d', borderColor: '#166534' }; // Campo Verde Grama
      case 'sintetico':
        return { backgroundColor: '#047857', borderColor: '#065f46' }; // Society
      case 'madeira':
        return { backgroundColor: '#9a3412', borderColor: '#7c2d12' }; // Madeira Envernizada (Futsal / Basquete)
      case 'street':
        return { backgroundColor: '#334155', borderColor: '#1e293b' }; // Asfalto Street 3x3
      default:
        return { backgroundColor: '#15803d', borderColor: '#166534' };
    }
  };

  const isBasketball = sportId === 'basquete';
  const is3x3 = modalityConfig.modalityId === 'basquete_3x3';

  return (
    <View style={[styles.pitchContainer, getPitchStyle()]}>
      {/* Linhas demarcatórias da quadra / campo */}
      <View style={styles.pitchBoundary}>
        {!is3x3 ? (
          <>
            {/* Linha de Meio Campo */}
            <View style={styles.halfwayLine} />
            {/* Círculo Central */}
            <View style={styles.centerCircle} />
            <View style={styles.centerPoint} />
            {/* Área Superior (Adversário) */}
            <View style={styles.topPenaltyArea} />
            {/* Área Inferior (Nosso Time) */}
            <View style={styles.bottomPenaltyArea} />
            <View style={styles.bottomGoalBox} />
          </>
        ) : (
          <>
            {/* Meia quadra Basquete 3x3 */}
            <View style={styles.keyArea} />
            <View style={styles.threePointArc} />
            <View style={styles.basketRim} />
          </>
        )}

        {/* Renderização dinâmica dos Slots táticos por coordenadas (x%, y%) */}
        {slots.map(slot => {
          const assignedPlayer = slot.jogadorId ? playersMap[slot.jogadorId] : undefined;
          const isSelected = selectedSlotId === slot.slotId;

          return (
            <TouchableOpacity
              key={slot.slotId}
              activeOpacity={0.8}
              onPress={() => onSlotPress(slot)}
              style={[
                styles.slotContainer,
                {
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                },
              ]}
            >
              {assignedPlayer ? (
                // Jogador escalado
                <View style={styles.playerBadgeWrapper}>
                  <View
                    style={[
                      styles.playerNumberCircle,
                      isSelected ? styles.selectedBorder : null,
                    ]}
                  >
                    <Text style={styles.playerNumberText}>{assignedPlayer.numero}</Text>
                  </View>
                  <View style={styles.playerNamePill}>
                    <Text style={styles.playerNameText} numberOfLines={1}>
                      {assignedPlayer.apelido || assignedPlayer.nome.split(' ')[0]}
                    </Text>
                    <Text style={styles.playerPosTag}>{slot.positionName}</Text>
                  </View>
                </View>
              ) : (
                // Slot Vazio
                <View
                  style={[
                    styles.emptySlotCircle,
                    isSelected ? styles.selectedBorder : null,
                  ]}
                >
                  <Text style={styles.emptySlotPos}>{slot.positionName}</Text>
                  <Text style={styles.emptySlotAdd}>+</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pitchContainer: {
    width: '100%',
    height: PITCH_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pitchBoundary: {
    flex: 1,
    margin: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 8,
    position: 'relative',
  },
  halfwayLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  centerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 90,
    height: 90,
    marginLeft: -45,
    marginTop: -45,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  centerPoint: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 6,
    height: 6,
    marginLeft: -3,
    marginTop: -3,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  topPenaltyArea: {
    position: 'absolute',
    top: 0,
    left: '25%',
    width: '50%',
    height: 55,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  bottomPenaltyArea: {
    position: 'absolute',
    bottom: 0,
    left: '22%',
    width: '56%',
    height: 65,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  bottomGoalBox: {
    position: 'absolute',
    bottom: 0,
    left: '36%',
    width: '28%',
    height: 26,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  // Basquete 3x3 Meia Quadra
  keyArea: {
    position: 'absolute',
    top: 0,
    left: '30%',
    width: '40%',
    height: 120,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  threePointArc: {
    position: 'absolute',
    top: -20,
    left: '12%',
    width: '76%',
    height: 220,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 110,
  },
  basketRim: {
    position: 'absolute',
    top: 15,
    left: '50%',
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: 8,
    backgroundColor: '#ea580c',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  // Slots Táticos
  slotContainer: {
    position: 'absolute',
    marginLeft: -24,
    marginTop: -24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  playerBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    elevation: 3,
  },
  playerNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  playerNamePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
    alignItems: 'center',
  },
  playerNameText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    maxWidth: 60,
  },
  playerPosTag: {
    color: '#38bdf8',
    fontSize: 8,
    fontWeight: '700',
  },
  emptySlotCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  emptySlotPos: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  emptySlotAdd: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    marginTop: -4,
  },
  selectedBorder: {
    borderColor: '#facc15',
    borderWidth: 3,
  },
});

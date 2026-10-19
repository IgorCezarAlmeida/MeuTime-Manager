import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Player, PlayerStatus } from '../../types';

interface PlayerCardProps {
  player: Player;
  onEdit?: (player: Player) => void;
  onDelete?: (player: Player) => void;
  onPress?: (player: Player) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onEdit,
  onDelete,
  onPress,
}) => {
  const getStatusBadge = (status: PlayerStatus) => {
    switch (status) {
      case 'ativo':
        return { label: 'Ativo', bg: '#14532d', text: '#4ade80' };
      case 'lesionado':
        return { label: 'Lesionado', bg: '#7f1d1d', text: '#f87171' };
      case 'suspenso':
        return { label: 'Suspenso', bg: '#78350f', text: '#fbbf24' };
      default:
        return { label: 'Inativo', bg: '#334155', text: '#94a3b8' };
    }
  };

  const statusInfo = getStatusBadge(player.status);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress && onPress(player)}
      style={styles.card}
    >
      <View style={styles.header}>
        {/* Número da camisa */}
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{player.numero}</Text>
        </View>

        {/* Informações centrais */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {player.nome}
          </Text>
          {player.apelido ? (
            <Text style={styles.nickname}>"{player.apelido}"</Text>
          ) : null}
          <View style={styles.tagsRow}>
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>{player.posicao}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(player)}
              style={styles.actionBtn}
            >
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(player)}
              style={[styles.actionBtn, styles.deleteBtn]}
            >
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Estatísticas resumidas */}
      <View style={styles.footer}>
        <Text style={styles.statItem}>
          Jogos: <Text style={styles.statVal}>{player.estatisticas?.jogos || 0}</Text>
        </Text>
        <Text style={styles.statItem}>
          Gols/Cestas: <Text style={styles.statVal}>{player.estatisticas?.gols || 0}</Text>
        </Text>
        <Text style={styles.statItem}>
          Assists: <Text style={styles.statVal}>{player.estatisticas?.assistencias || 0}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  nickname: {
    color: '#94a3b8',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  positionBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  positionText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: '#450a0a',
  },
  actionText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statItem: {
    color: '#94a3b8',
    fontSize: 12,
  },
  statVal: {
    color: '#f8fafc',
    fontWeight: '700',
  },
});

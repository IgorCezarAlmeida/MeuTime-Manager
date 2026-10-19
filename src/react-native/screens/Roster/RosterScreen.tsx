import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Player, ModalityConfig, Team } from '../../../types';
import { PlayerCard } from '../../components/PlayerCard';
import { CustomButton } from '../../components/CustomButton';
import { PlayerFormModal } from './PlayerFormModal';
import { CreatePlayerDTO } from '../../services/firebase/playerService';

interface RosterScreenProps {
  team: Team;
  modalityConfig: ModalityConfig | null;
  players: Player[];
  isCoach: boolean;
  onAddPlayer: (dto: CreatePlayerDTO) => Promise<any>;
  onUpdatePlayer: (playerId: string, dto: Partial<CreatePlayerDTO>) => Promise<any>;
  onRemovePlayer: (playerId: string) => Promise<any>;
}

export const RosterScreen: React.FC<RosterScreenProps> = ({
  team,
  modalityConfig,
  players,
  isCoach,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [filterPos, setFilterPos] = useState<string>('all');

  const handleOpenAdd = () => {
    setPlayerToEdit(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (player: Player) => {
    setPlayerToEdit(player);
    setModalVisible(true);
  };

  const handleConfirmDelete = (player: Player) => {
    Alert.alert(
      'Remover Atleta',
      `Deseja remover ${player.nome} do elenco ativo? Seu histórico esportivo será preservado (RN11).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await onRemovePlayer(player.id);
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Falha ao remover atleta.');
            }
          },
        },
      ]
    );
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Venha fazer parte do elenco do ${team.nome} no MeuTime Manager! Use o código de convite: ${team.codigoConvite}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = players.filter(p => {
    if (filterPos === 'all') return true;
    return p.posicao.toLowerCase().includes(filterPos.toLowerCase());
  });

  return (
    <View style={styles.container}>
      {/* Header com Informações da Equipe e Convite */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.teamName}>{team.nome}</Text>
          <Text style={styles.teamMeta}>
            {modalityConfig?.name} • {players.length} Atletas
          </Text>
        </View>

        {isCoach && (
          <CustomButton
            title="+ Jogador"
            onPress={handleOpenAdd}
            style={styles.addBtn}
          />
        )}
      </View>

      {/* Card do Código de Convite (RF09) */}
      <View style={styles.inviteCard}>
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteLabel}>Código de Convite do Time</Text>
          <Text style={styles.inviteCode}>{team.codigoConvite}</Text>
        </View>
        <TouchableOpacity onPress={handleShareInvite} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Compartilhar 📲</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro Rápido por Posição */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setFilterPos('all')}
          style={[styles.filterChip, filterPos === 'all' ? styles.filterChipActive : null]}
        >
          <Text style={[styles.filterText, filterPos === 'all' ? styles.filterTextActive : null]}>
            Todos ({players.length})
          </Text>
        </TouchableOpacity>

        {modalityConfig?.positions.map(pos => (
          <TouchableOpacity
            key={pos.id}
            onPress={() => setFilterPos(pos.name)}
            style={[styles.filterChip, filterPos === pos.name ? styles.filterChipActive : null]}
          >
            <Text style={[styles.filterText, filterPos === pos.name ? styles.filterTextActive : null]}>
              {pos.shortName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista do Elenco */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            onEdit={isCoach ? handleOpenEdit : undefined}
            onDelete={isCoach ? handleConfirmDelete : undefined}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum jogador encontrado</Text>
            <Text style={styles.emptySubtitle}>
              {isCoach
                ? 'Cadastre jogadores manualmente pelo botão "+ Jogador" ou envie o código de convite para os atletas.'
                : 'Nenhum atleta cadastrado neste filtro.'}
            </Text>
          </View>
        }
      />

      {/* Modal de Criação / Edição */}
      <PlayerFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        playerToEdit={playerToEdit}
        modalityConfig={modalityConfig}
        onSavePlayer={async dto => {
          if (playerToEdit) {
            await onUpdatePlayer(playerToEdit.id, dto);
          } else {
            await onAddPlayer(dto);
          }
        }}
      />
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
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
  },
  teamMeta: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  addBtn: {
    height: 40,
    paddingHorizontal: 14,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  inviteCode: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 2,
  },
  shareBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 40,
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
});

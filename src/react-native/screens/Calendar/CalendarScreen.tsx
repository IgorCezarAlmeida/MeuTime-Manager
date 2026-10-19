import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Match, Training, Player, Attendance } from '../../../types';
import { EventCard } from '../../components/EventCard';
import { CustomButton } from '../../components/CustomButton';
import { MatchFormModal } from './MatchFormModal';
import { TrainingFormModal } from './TrainingFormModal';
import { MatchResultModal } from './MatchResultModal';
import { AttendanceModal } from '../../components/AttendanceModal';
import { CreateMatchDTO } from '../../services/firebase/matchService';
import { CreateTrainingDTO } from '../../services/firebase/trainingService';
import { MatchResult } from '../../../types';

interface CalendarScreenProps {
  isCoach: boolean;
  matches: Match[];
  trainings: Training[];
  players: Player[];
  currentPlayerId?: string;
  onCreateMatch: (dto: CreateMatchDTO) => Promise<any>;
  onCreateTraining: (dto: CreateTrainingDTO) => Promise<any>;
  onRecordResult: (matchId: string, result: MatchResult) => Promise<any>;
  getAttendancesForEvent: (type: 'partida' | 'treino', id: string) => Promise<Attendance[]>;
  onConfirmAttendance: (type: 'partida' | 'treino', id: string, status: any, just?: string) => Promise<any>;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  isCoach,
  matches,
  trainings,
  players,
  currentPlayerId,
  onCreateMatch,
  onCreateTraining,
  onRecordResult,
  getAttendancesForEvent,
  onConfirmAttendance,
}) => {
  const [activeTab, setActiveTab] = useState<'partidas' | 'treinos'>('partidas');
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [trainingModalVisible, setTrainingModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Modal de Presença
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    type: 'partida' | 'treino';
    id: string;
    title: string;
  } | null>(null);
  const [currentAttendances, setCurrentAttendances] = useState<Attendance[]>([]);

  const handleOpenAttendance = async (type: 'partida' | 'treino', id: string, title: string) => {
    setSelectedEvent({ type, id, title });
    const list = await getAttendancesForEvent(type, id);
    setCurrentAttendances(list);
    setAttendanceModalVisible(true);
  };

  const handleOpenResult = (match: Match) => {
    setSelectedMatch(match);
    setResultModalVisible(true);
  };

  const playersMap = players.reduce<Record<string, Player>>((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      {/* Header com botões de ação do Técnico */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Calendário Esportivo</Text>
          <Text style={styles.subtitle}>Partidas, Treinamentos e Presenças</Text>
        </View>

        {isCoach && (
          <CustomButton
            title={activeTab === 'partidas' ? '+ Partida' : '+ Treino'}
            onPress={() => {
              if (activeTab === 'partidas') setMatchModalVisible(true);
              else setTrainingModalVisible(true);
            }}
            style={styles.addBtn}
          />
        )}
      </View>

      {/* Seletor de Abas (Partidas vs Treinos) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('partidas')}
          style={[styles.tab, activeTab === 'partidas' ? styles.tabActive : null]}
        >
          <Text style={[styles.tabText, activeTab === 'partidas' ? styles.tabTextActive : null]}>
            Partidas ({matches.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('treinos')}
          style={[styles.tab, activeTab === 'treinos' ? styles.tabActive : null]}
        >
          <Text style={[styles.tabText, activeTab === 'treinos' ? styles.tabTextActive : null]}>
            Treinos ({trainings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Eventos */}
      {activeTab === 'partidas' ? (
        <FlatList
          data={matches}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <EventCard
              type="partida"
              match={item}
              isCoach={isCoach}
              onRecordResult={handleOpenResult}
              onCheckAttendance={() =>
                handleOpenAttendance('partida', item.id, `Partida vs ${item.adversario}`)
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nenhuma partida cadastrada</Text>
              <Text style={styles.emptySubtitle}>
                {isCoach ? 'Toque no botão "+ Partida" para agendar jogos.' : 'Nenhum jogo programado.'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={trainings}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <EventCard
              type="treino"
              training={item}
              isCoach={isCoach}
              onCheckAttendance={() =>
                handleOpenAttendance('treino', item.id, `Treinamento: ${item.titulo}`)
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nenhum treino agendado</Text>
              <Text style={styles.emptySubtitle}>
                {isCoach ? 'Toque em "+ Treino" para criar uma sessão técnica/tática.' : 'Nenhum treino marcado.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Modais */}
      <MatchFormModal
        visible={matchModalVisible}
        onClose={() => setMatchModalVisible(false)}
        onSaveMatch={onCreateMatch}
      />

      <TrainingFormModal
        visible={trainingModalVisible}
        onClose={() => setTrainingModalVisible(false)}
        onSaveTraining={onCreateTraining}
      />

      <MatchResultModal
        visible={resultModalVisible}
        onClose={() => setResultModalVisible(false)}
        match={selectedMatch}
        players={players}
        onSaveResult={onRecordResult}
      />

      {selectedEvent && (
        <AttendanceModal
          visible={attendanceModalVisible}
          onClose={() => setAttendanceModalVisible(false)}
          eventTitle={selectedEvent.title}
          isCoach={isCoach}
          attendances={currentAttendances}
          playersMap={playersMap}
          currentPlayerId={currentPlayerId}
          onConfirmAttendance={async (status, just) => {
            await onConfirmAttendance(selectedEvent.type, selectedEvent.id, status, just);
            const updated = await getAttendancesForEvent(selectedEvent.type, selectedEvent.id);
            setCurrentAttendances(updated);
          }}
        />
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
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

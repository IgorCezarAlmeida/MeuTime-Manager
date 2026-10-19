import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Match, Training, Player, AttendanceStatus, Attendance } from '../../../types';
import { attendanceService } from '../../services/firebase/attendanceService';

interface AttendanceScreenProps {
  isCoach: boolean;
  currentPlayerId?: string;
  matches: Match[];
  trainings: Training[];
  players: Player[];
  timeId: string;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  isCoach,
  currentPlayerId,
  matches,
  trainings,
  players,
  timeId,
}) => {
  // Evento selecionado no momento
  const allEvents = [
    ...matches.map(m => ({
      id: m.id,
      tipo: 'partida' as const,
      title: `Partida vs ${m.adversario}`,
      date: `${m.data} às ${m.horario}`,
    })),
    ...trainings.map(t => ({
      id: t.id,
      tipo: 'treino' as const,
      title: `Treino: ${t.titulo}`,
      date: `${t.data} às ${t.horario}`,
    })),
  ];

  const [selectedEventId, setSelectedEventId] = useState<string>(allEvents[0]?.id || '');
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedEvent = allEvents.find(e => e.id === selectedEventId) || allEvents[0];

  const fetchAttendance = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const list = await attendanceService.getAttendanceByEvent(
        selectedEvent.tipo,
        selectedEvent.id
      );
      setAttendances(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedEventId]);

  const handleSetMyAttendance = async (status: AttendanceStatus) => {
    if (!currentPlayerId || !selectedEvent) return;
    try {
      await attendanceService.setAttendance({
        timeId,
        eventoTipo: selectedEvent.tipo,
        eventoId: selectedEvent.id,
        jogadorId: currentPlayerId,
        status,
      });
      await fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const myStatus = currentPlayerId
    ? attendances.find(a => a.jogadorId === currentPlayerId)?.status
    : undefined;

  const confirmados = attendances.filter(a => a.status === 'confirmado');
  const recusados = attendances.filter(a => a.status === 'recusado');
  const duvidas = attendances.filter(a => a.status === 'duvida');

  const playersMap = players.reduce<Record<string, Player>>((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Presença & Disponibilidade (RF19)</Text>
        <Text style={styles.subtitle}>
          {isCoach ? 'Consulte quem vai aos jogos e treinos' : 'Confirme sua presença nos eventos'}
        </Text>
      </View>

      {/* Carrossel de Seleção de Eventos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventSelector}>
        {allEvents.map(evt => (
          <TouchableOpacity
            key={evt.id}
            onPress={() => setSelectedEventId(evt.id)}
            style={[
              styles.eventChip,
              selectedEventId === evt.id ? styles.eventChipActive : null,
            ]}
          >
            <Text
              style={[
                styles.eventChipTitle,
                selectedEventId === evt.id ? styles.eventChipTitleActive : null,
              ]}
              numberOfLines={1}
            >
              {evt.title}
            </Text>
            <Text style={styles.eventChipDate}>{evt.date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedEvent ? (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Caixa de Ação Rápida para o Jogador Logado (UC05, RN08) */}
          {!isCoach && (
            <View style={styles.myActionCard}>
              <Text style={styles.myActionTitle}>Sua Confirmação de Presença:</Text>
              <Text style={styles.myActionNotice}>
                RN08: Confirmar presença não obriga a ser titular na escalação.
              </Text>
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  onPress={() => handleSetMyAttendance('confirmado')}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: myStatus === 'confirmado' ? '#16a34a' : '#1e293b' },
                  ]}
                >
                  <Text style={styles.actionBtnText}>✅ Vou</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSetMyAttendance('duvida')}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: myStatus === 'duvida' ? '#ca8a04' : '#1e293b' },
                  ]}
                >
                  <Text style={styles.actionBtnText}>🤔 Dúvida</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSetMyAttendance('recusado')}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: myStatus === 'recusado' ? '#dc2626' : '#1e293b' },
                  ]}
                >
                  <Text style={styles.actionBtnText}>❌ Não Vou</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Métricas de Disponibilidade para o Técnico (RF19) */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { borderColor: '#16a34a' }]}>
              <Text style={[styles.metricValue, { color: '#4ade80' }]}>
                {confirmados.length}
              </Text>
              <Text style={styles.metricLabel}>Confirmados</Text>
            </View>

            <View style={[styles.metricCard, { borderColor: '#ca8a04' }]}>
              <Text style={[styles.metricValue, { color: '#facc15' }]}>
                {duvidas.length}
              </Text>
              <Text style={styles.metricLabel}>Dúvidas</Text>
            </View>

            <View style={[styles.metricCard, { borderColor: '#dc2626' }]}>
              <Text style={[styles.metricValue, { color: '#f87171' }]}>
                {recusados.length}
              </Text>
              <Text style={styles.metricLabel}>Recusados</Text>
            </View>
          </View>

          {/* Listagem Detalhada de Atletas que Responderam */}
          <Text style={styles.sectionTitle}>
            Respostas dos Atletas ({attendances.length})
          </Text>

          {attendances.map(att => {
            const player = playersMap[att.jogadorId];
            const getStatusBadge = () => {
              if (att.status === 'confirmado') return { text: 'CONFIRMADO', bg: '#14532d', color: '#4ade80' };
              if (att.status === 'recusado') return { text: 'NÃO VAI', bg: '#7f1d1d', color: '#f87171' };
              return { text: 'DÚVIDA', bg: '#78350f', color: '#fbbf24' };
            };
            const badge = getStatusBadge();

            return (
              <View key={att.id} style={styles.attItem}>
                <View style={styles.attItemLeft}>
                  <Text style={styles.attPlayerName}>
                    {player ? `#${player.numero} ${player.nome}` : att.jogadorId}
                  </Text>
                  <Text style={styles.attPlayerPos}>
                    {player?.posicao || 'Atleta'}
                  </Text>
                </View>
                <View style={[styles.attBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.attBadgeText, { color: badge.color }]}>
                    {badge.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {attendances.length === 0 && (
            <Text style={styles.emptyText}>
              Nenhum jogador respondeu a este evento ainda.
            </Text>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhum evento no calendário</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 10,
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
  eventSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 14,
    maxHeight: 64,
  },
  eventChip: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
    maxWidth: 200,
  },
  eventChipActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  eventChipTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  eventChipTitleActive: {
    color: '#ffffff',
  },
  eventChipDate: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  myActionCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  myActionTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  myActionNotice: {
    color: '#94a3b8',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  attItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  attItemLeft: {
    flex: 1,
  },
  attPlayerName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  attPlayerPos: {
    color: '#94a3b8',
    fontSize: 12,
  },
  attBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  attBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  emptyText: {
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#94a3b8',
    fontSize: 16,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Match, Training } from '../../types';

interface EventCardProps {
  type: 'partida' | 'treino';
  match?: Match;
  training?: Training;
  onPress?: () => void;
  onRecordResult?: (match: Match) => void;
  onCheckAttendance?: () => void;
  isCoach?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  type,
  match,
  training,
  onPress,
  onRecordResult,
  onCheckAttendance,
  isCoach = true,
}) => {
  const isMatch = type === 'partida' && !!match;
  const isFinished = isMatch && match.status === 'finalizada';

  const title = isMatch ? `vs ${match.adversario}` : training?.titulo;
  const date = isMatch ? match.data : training?.data;
  const time = isMatch ? match.horario : training?.horario;
  const location = isMatch ? match.local : training?.local;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{isMatch ? 'PARTIDA' : 'TREINO'}</Text>
        </View>

        {isFinished && match.resultado ? (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>
              {match.resultado.placarTime} x {match.resultado.placarAdversario}
            </Text>
          </View>
        ) : (
          <View style={styles.dateTimeBadge}>
            <Text style={styles.dateTimeText}>📅 {date} às {time}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <Text style={styles.location} numberOfLines={1}>
        📍 {location}
      </Text>

      {/* Observações / Foco */}
      {isMatch && match.observacoes ? (
        <Text style={styles.note} numberOfLines={1}>
          ℹ️ {match.observacoes}
        </Text>
      ) : null}

      {!isMatch && training?.foco ? (
        <View style={styles.focusBadge}>
          <Text style={styles.focusText}>Foco: {training.foco.toUpperCase()}</Text>
        </View>
      ) : null}

      {/* Botões de Ação na parte inferior */}
      <View style={styles.footer}>
        {isCoach && isMatch && !isFinished && onRecordResult && (
          <TouchableOpacity
            onPress={() => onRecordResult(match)}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>Registrar Placar</Text>
          </TouchableOpacity>
        )}

        {onCheckAttendance && (
          <TouchableOpacity
            onPress={onCheckAttendance}
            style={[styles.actionBtn, styles.attendanceBtn]}
          >
            <Text style={styles.actionBtnText}>Presenças</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateTimeBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateTimeText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  location: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 6,
  },
  note: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  focusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  focusText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  actionBtn: {
    flex: 1,
    height: 36,
    backgroundColor: '#2563eb',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceBtn: {
    backgroundColor: '#334155',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { usePlayers } from '../hooks/usePlayers';
import { useMatches } from '../hooks/useMatches';
import { useTrainings } from '../hooks/useTrainings';
import { useLineup } from '../hooks/useLineup';
import { useTactics } from '../hooks/useTactics';

import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { TeamSetupScreen } from '../screens/Team/TeamSetupScreen';
import { RosterScreen } from '../screens/Roster/RosterScreen';
import { CalendarScreen } from '../screens/Calendar/CalendarScreen';
import { LineupScreen } from '../screens/Lineup/LineupScreen';
import { TacticsScreen } from '../screens/Tactics/TacticsScreen';
import { AttendanceScreen } from '../screens/Attendance/AttendanceScreen';
import { attendanceService } from '../services/firebase/attendanceService';

export type MobileTab = 'roster' | 'calendar' | 'lineup' | 'tactics' | 'attendance';

export const AppNavigator: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<MobileTab>('roster');

  const {
    currentUser,
    isAuthenticated,
    isCoach,
    loading: authLoading,
    login,
    register,
    logout,
    recoverPassword,
  } = useAuth();

  const {
    team,
    modalityConfig,
    createTeam,
    findTeamByInvite,
    reloadTeam,
  } = useTeam(currentUser?.timeVinculadoId, currentUser?.uid);

  const {
    players,
    addPlayer,
    updatePlayer,
    removePlayer,
  } = usePlayers(team?.id);

  const {
    matches,
    createMatch,
    recordResult,
  } = useMatches(team?.id);

  const {
    trainings,
    createTraining,
  } = useTrainings(team?.id);

  const {
    selectedFormation,
    startersSlots,
    benchPlayerIds,
    isPublished,
    saving: lineupSaving,
    changeFormation,
    assignStarter,
    unassignStarter,
    toggleBenchPlayer,
    saveCurrentLineup,
    togglePublish,
  } = useLineup(team?.id, undefined, team?.modalidade, team?.esporte);

  const {
    tactics,
    createTactic,
    deleteTactic,
  } = useTactics(team?.id, team?.modalidade);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando MeuTime Manager...</Text>
      </View>
    );
  }

  // Se não autenticado -> Telas de Login / Cadastro
  if (!isAuthenticated || !currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        {authView === 'login' ? (
          <LoginScreen
            onLogin={login}
            onNavigateToRegister={() => setAuthView('register')}
            onForgotPassword={recoverPassword}
          />
        ) : (
          <RegisterScreen
            onRegister={register}
            onNavigateToLogin={() => setAuthView('login')}
          />
        )}
      </SafeAreaView>
    );
  }

  // Se autenticado mas sem time vinculado -> Tela de Criar ou Entrar em Equipe (UC01 / UC03)
  if (!team) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <TeamSetupScreen
          isCoach={isCoach}
          coachUid={currentUser.uid}
          coachName={currentUser.nome}
          onCreateTeam={async dto => {
            const newTeam = await createTeam(currentUser.uid, currentUser.nome, dto);
            await reloadTeam();
            return newTeam;
          }}
          onJoinTeamWithInvite={async code => {
            const found = await findTeamByInvite(code);
            if (!found) throw new Error('Time não encontrado.');
            // Vincula usuário ao time
            const { authService } = await import('../services/firebase/authService');
            await authService.updateUserProfile(currentUser.uid, {
              timeVinculadoId: found.id,
            });
            await reloadTeam();
            return found;
          }}
        />
      </SafeAreaView>
    );
  }

  // Abas disponíveis para Técnico vs Jogador (Seção 16 do Documento)
  const tabs: { id: MobileTab; label: string; icon: string }[] = isCoach
    ? [
        { id: 'roster', label: 'Elenco', icon: '👥' },
        { id: 'lineup', label: 'Escalação', icon: '📋' },
        { id: 'calendar', label: 'Calendário', icon: '📅' },
        { id: 'tactics', label: 'Táticas', icon: '🎯' },
        { id: 'attendance', label: 'Presenças', icon: '✅' },
      ]
    : [
        { id: 'roster', label: 'Equipe', icon: '👥' },
        { id: 'calendar', label: 'Calendário', icon: '📅' },
        { id: 'attendance', label: 'Presença', icon: '✅' },
        { id: 'lineup', label: 'Escalação', icon: '📋' },
      ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Barra Superior com Perfil do Usuário e Logout */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <Text style={styles.userRole}>
            {isCoach ? '👔 Técnico' : '🏃 Atleta'}
          </Text>
          <Text style={styles.userName} numberOfLines={1}>
            {currentUser.nome}
          </Text>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair 🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo da Aba Ativa */}
      <View style={styles.screenContainer}>
        {currentTab === 'roster' && (
          <RosterScreen
            team={team}
            modalityConfig={modalityConfig}
            players={players}
            isCoach={isCoach}
            onAddPlayer={addPlayer}
            onUpdatePlayer={updatePlayer}
            onRemovePlayer={removePlayer}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarScreen
            isCoach={isCoach}
            matches={matches}
            trainings={trainings}
            players={players}
            currentPlayerId={currentUser.jogadorVinculadoId}
            onCreateMatch={createMatch}
            onCreateTraining={createTraining}
            onRecordResult={recordResult}
            getAttendancesForEvent={(type, id) =>
              attendanceService.getAttendanceByEvent(type, id)
            }
            onConfirmAttendance={(type, id, status, just) =>
              attendanceService.setAttendance({
                timeId: team.id,
                eventoTipo: type,
                eventoId: id,
                jogadorId: currentUser.jogadorVinculadoId || currentUser.uid,
                status,
                justificativa: just,
              })
            }
          />
        )}

        {currentTab === 'lineup' && (
          <LineupScreen
            team={team}
            modalityConfig={modalityConfig}
            players={players}
            isCoach={isCoach}
            selectedFormation={selectedFormation}
            startersSlots={startersSlots}
            benchPlayerIds={benchPlayerIds}
            isPublished={isPublished}
            saving={lineupSaving}
            onChangeFormation={changeFormation}
            onAssignStarter={assignStarter}
            onUnassignStarter={unassignStarter}
            onToggleBench={toggleBenchPlayer}
            onSaveLineup={saveCurrentLineup}
            onTogglePublish={togglePublish}
          />
        )}

        {currentTab === 'tactics' && (
          <TacticsScreen
            isCoach={isCoach}
            tactics={tactics}
            modalityConfig={modalityConfig}
            onCreateTactic={createTactic}
            onDeleteTactic={deleteTactic}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceScreen
            isCoach={isCoach}
            currentPlayerId={currentUser.jogadorVinculadoId}
            matches={matches}
            trainings={trainings}
            players={players}
            timeId={team.id}
          />
        )}
      </View>

      {/* Barra Inferior de Navegação (Bottom Tab Bar) */}
      <View style={styles.bottomNav}>
        {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setCurrentTab(tab.id)}
              style={styles.navItem}
            >
              <Text style={styles.navIcon}>{tab.icon}</Text>
              <Text
                style={[
                  styles.navLabel,
                  isActive ? styles.navLabelActive : null,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  userInfo: {
    flex: 1,
  },
  userRole: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  userName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#1e293b',
    borderRadius: 6,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingBottom: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
});

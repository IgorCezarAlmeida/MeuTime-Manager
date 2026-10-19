import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PersonaSwitcher } from './components/common/PersonaSwitcher';
import { AndroidFrame } from './components/common/AndroidFrame';
import { BottomTabBar, ScreenTab } from './components/common/BottomTabBar';

import { DashboardScreen } from './components/screens/DashboardScreen';
import { RosterScreen } from './components/screens/RosterScreen';
import { LineupScreen } from './components/screens/LineupScreen';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { TacticsScreen } from './components/screens/TacticsScreen';
import { AttendanceScreen } from './components/screens/AttendanceScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

import { CreateTeamModal } from './components/modals/CreateTeamModal';
import { AddPlayerModal } from './components/modals/AddPlayerModal';
import { CreateMatchModal } from './components/modals/CreateMatchModal';
import { CreateTrainingModal } from './components/modals/CreateTrainingModal';
import { MatchResultModal } from './components/modals/MatchResultModal';
import { ShareLineupModal } from './components/modals/ShareLineupModal';
import { JoinTeamModal } from './components/modals/JoinTeamModal';

import { Player, Match, Lineup } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('dashboard');
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(true);

  // Modal States
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
  const [isCreateTrainingOpen, setIsCreateTrainingOpen] = useState(false);
  const [matchForResult, setMatchForResult] = useState<Match | null>(null);
  const [lineupForShare, setLineupForShare] = useState<Lineup | null>(null);
  const [isJoinTeamOpen, setIsJoinTeamOpen] = useState(false);

  const handleEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    setIsAddPlayerOpen(true);
  };

  const handleOpenAddPlayer = () => {
    setPlayerToEdit(null);
    setIsAddPlayerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Prototype & Persona Switcher */}
      <PersonaSwitcher
        isMobileDeviceView={isMobileDeviceView}
        setIsMobileDeviceView={setIsMobileDeviceView}
        onOpenCreateTeamModal={() => setIsCreateTeamOpen(true)}
      />

      {/* Main Content Area in Android Frame or Fullscreen */}
      <AndroidFrame isMobileDeviceView={isMobileDeviceView}>
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
          {/* Active Screen Tab */}
          {activeTab === 'dashboard' && (
            <DashboardScreen
              onNavigate={setActiveTab}
              onOpenCreateMatch={() => setIsCreateMatchOpen(true)}
              onOpenAddPlayer={handleOpenAddPlayer}
              onOpenJoinTeam={() => setIsJoinTeamOpen(true)}
            />
          )}

          {activeTab === 'roster' && (
            <RosterScreen
              onOpenAddPlayer={handleOpenAddPlayer}
              onEditPlayer={handleEditPlayer}
              onOpenJoinTeam={() => setIsJoinTeamOpen(true)}
            />
          )}

          {activeTab === 'lineup' && (
            <LineupScreen
              onOpenShareModal={(l) => setLineupForShare(l)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarScreen
              onOpenCreateMatch={() => setIsCreateMatchOpen(true)}
              onOpenCreateTraining={() => setIsCreateTrainingOpen(true)}
              onOpenResultModal={(m) => setMatchForResult(m)}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'tactics' && <TacticsScreen />}

          {activeTab === 'attendance' && <AttendanceScreen />}

          {activeTab === 'profile' && (
            <ProfileScreen
              onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
              onOpenJoinTeam={() => setIsJoinTeamOpen(true)}
            />
          )}

          {/* Bottom Tab Bar */}
          <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </AndroidFrame>

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
      />

      <AddPlayerModal
        isOpen={isAddPlayerOpen}
        onClose={() => {
          setIsAddPlayerOpen(false);
          setPlayerToEdit(null);
        }}
        playerToEdit={playerToEdit}
      />

      <CreateMatchModal
        isOpen={isCreateMatchOpen}
        onClose={() => setIsCreateMatchOpen(false)}
      />

      <CreateTrainingModal
        isOpen={isCreateTrainingOpen}
        onClose={() => setIsCreateTrainingOpen(false)}
      />

      <MatchResultModal
        isOpen={!!matchForResult}
        onClose={() => setMatchForResult(null)}
        match={matchForResult}
      />

      <ShareLineupModal
        isOpen={!!lineupForShare}
        onClose={() => setLineupForShare(null)}
        lineup={lineupForShare}
      />

      <JoinTeamModal
        isOpen={isJoinTeamOpen}
        onClose={() => setIsJoinTeamOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

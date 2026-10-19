import React from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, RotateCcw, Shield, UserCheck, ChevronDown } from 'lucide-react';

interface PersonaSwitcherProps {
  isMobileDeviceView: boolean;
  setIsMobileDeviceView: (val: boolean) => void;
  onOpenCreateTeamModal: () => void;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  isMobileDeviceView,
  setIsMobileDeviceView,
  onOpenCreateTeamModal,
}) => {
  const { currentUser, users, setCurrentUser, resetToInitialData, activeTeam, teams, setActiveTeamId } = useApp();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 shrink-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Brand Wordmark & Mode Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              MeuTime Manager
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Android Prototype</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Active Team Selector */}
          <div className="relative inline-flex items-center">
            <select
              value={activeTeam?.id || ''}
              onChange={(e) => setActiveTeamId(e.target.value)}
              className="bg-slate-800/90 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.modalidade.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center / Right: Persona Switcher and Viewport Control */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Persona selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
            <span className="text-slate-400 pl-1 text-[11px] font-medium hidden sm:inline">Perfil:</span>
            <select
              value={currentUser.uid}
              onChange={(e) => {
                const selected = users.find((u) => u.uid === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
              className="bg-transparent text-white font-medium text-xs focus:outline-hidden cursor-pointer pr-1"
            >
              {users.map((u) => (
                <option key={u.uid} value={u.uid} className="bg-slate-900 text-white">
                  {u.role === 'tecnico' ? '👔 Técnico: ' : '⚽ Jogador: '}
                  {u.nome}
                </option>
              ))}
            </select>
            <span
              className={`px-1.5 py-0.5 text-[10px] uppercase font-bold rounded ${
                currentUser.role === 'tecnico'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {currentUser.role === 'tecnico' ? 'Técnico' : 'Atleta'}
            </span>
          </div>

          {/* New Team Button (UC01) */}
          {currentUser.role === 'tecnico' && (
            <button
              onClick={onOpenCreateTeamModal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-medium transition-colors text-xs flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>+ Criar Equipe</span>
            </button>
          )}

          {/* Device viewport toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setIsMobileDeviceView(true)}
              className={`px-2 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                isMobileDeviceView
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Modo Celular Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Celular</span>
            </button>
            <button
              onClick={() => setIsMobileDeviceView(false)}
              className={`px-2 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                !isMobileDeviceView
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Modo Tela Cheia"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Expandido</span>
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={resetToInitialData}
            title="Restaurar dados de exemplo"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

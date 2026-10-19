import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Player } from '../../types';
import { MODALITIES_CONFIG } from '../../constants/sports';
import {
  UserPlus,
  Search,
  Phone,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Share2,
} from 'lucide-react';

interface RosterScreenProps {
  onOpenAddPlayer: () => void;
  onEditPlayer: (player: Player) => void;
  onOpenJoinTeam: () => void;
}

export const RosterScreen: React.FC<RosterScreenProps> = ({
  onOpenAddPlayer,
  onEditPlayer,
  onOpenJoinTeam,
}) => {
  const { activeTeam, players, removePlayer, currentUser, activeLineup } = useApp();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'todos' | 'titulares' | 'reservas' | 'dm'>('todos');
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  if (!activeTeam) return null;

  const config = MODALITIES_CONFIG[activeTeam.modalidade];
  const teamPlayers = players.filter((p) => p.timeId === activeTeam.id);

  // Identify starters and reserves in active lineup
  const starterIds = new Set(
    activeLineup?.titulares.map((s) => s.jogadorId).filter(Boolean) as string[]
  );

  // Filtered players
  const filtered = teamPlayers.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.apelido && p.apelido.toLowerCase().includes(search.toLowerCase())) ||
      p.numero.toString().includes(search) ||
      p.posicao.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'titulares') return starterIds.has(p.id);
    if (filterCategory === 'reservas') return !starterIds.has(p.id) && p.status === 'ativo';
    if (filterCategory === 'dm') return p.status === 'lesionado' || p.status === 'suspenso';
    return true;
  });

  const isCoach = currentUser.role === 'tecnico';

  const handleDelete = () => {
    if (playerToDelete) {
      removePlayer(playerToDelete.id);
      setPlayerToDelete(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* Header and Add Action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Elenco da Equipe
          </h2>
          <p className="text-xs text-slate-500">
            {teamPlayers.length} atletas cadastrados · {config.name}
          </p>
        </div>

        {isCoach && (
          <button
            onClick={onOpenAddPlayer}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Atleta</span>
          </button>
        )}
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, apelido, camisa ou posição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterCategory('todos')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              filterCategory === 'todos'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Todos ({teamPlayers.length})
          </button>
          <button
            onClick={() => setFilterCategory('titulares')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              filterCategory === 'titulares'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Titulares ({starterIds.size})
          </button>
          <button
            onClick={() => setFilterCategory('reservas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              filterCategory === 'reservas'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Reservas Disponíveis
          </button>
          <button
            onClick={() => setFilterCategory('dm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              filterCategory === 'dm'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            D.M. / Suspensos
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <p className="text-xs text-slate-500">Nenhum atleta encontrado com este filtro.</p>
          </div>
        ) : (
          filtered.map((player) => {
            const isStarter = starterIds.has(player.id);
            const isInjured = player.status === 'lesionado';
            const isSuspended = player.status === 'suspenso';
            const hasAccount = !!player.usuarioUid;

            return (
              <div
                key={player.id}
                className="p-3.5 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                {/* Left: Shirt number + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-athletic text-lg font-bold border-2 shrink-0 ${
                      player.posicao === 'GOL' || player.posicao === 'G'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-400'
                        : isStarter
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {player.numero}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {player.nome}
                      </span>
                      {player.apelido && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          "{player.apelido}"
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {player.posicao}
                        {player.posicaoSecundaria ? ` / ${player.posicaoSecundaria}` : ''}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{player.peDominante || 'Destro'}</span>

                      {isStarter && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            Titular
                          </span>
                        </>
                      )}

                      {isInjured && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-red-500 font-semibold">D.M.</span>
                        </>
                      )}

                      {isSuspended && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-500 font-semibold">Suspenso</span>
                        </>
                      )}
                    </div>

                    {/* Stats line */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                      <span>{player.estatisticas.jogos} jogos</span>
                      <span>·</span>
                      <span>
                        {player.estatisticas.gols}{' '}
                        {activeTeam.esporte === 'basquete' ? 'pts' : 'gols'}
                      </span>
                      <span>·</span>
                      <span>{player.estatisticas.presencaPct}% presença</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Account linking indicator */}
                  <div
                    title={
                      hasAccount
                        ? 'Conta de usuário vinculada ao atleta'
                        : 'Cadastro manual (aguardando app do jogador)'
                    }
                    className="p-1.5"
                  >
                    {hasAccount ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        Manual
                      </span>
                    )}
                  </div>

                  {player.telefone && (
                    <a
                      href={`https://wa.me/55${player.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Chamar no WhatsApp"
                      className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isCoach && (
                    <>
                      <button
                        onClick={() => onEditPlayer(player)}
                        title="Editar atleta"
                        className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setPlayerToDelete(player)}
                        title="Remover atleta"
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold">Remover do Elenco</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Deseja remover <strong>{playerToDelete.nome}</strong> (#{playerToDelete.numero}) do elenco?
              Conforme a regra RN11, o histórico esportivo de partidas do atleta será preservado.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

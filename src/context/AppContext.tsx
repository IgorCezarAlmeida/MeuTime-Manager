import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppUser,
  Team,
  Player,
  Match,
  Training,
  Lineup,
  Tactic,
  Attendance,
  AttendanceStatus,
  SportId,
  ModalityId,
  MatchResult,
} from '../types';
import { MODALITIES_CONFIG } from '../constants/sports';

interface AppContextType {
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  users: AppUser[];
  activeTeam: Team | null;
  setActiveTeamId: (teamId: string) => void;
  teams: Team[];
  players: Player[];
  matches: Match[];
  trainings: Training[];
  lineups: Lineup[];
  tactics: Tactic[];
  attendances: Attendance[];
  
  // Actions
  createTeam: (data: Omit<Team, 'id' | 'tecnicoUid' | 'tecnicoNome' | 'codigoConvite'>) => Promise<Team>;
  updateTeam: (teamId: string, data: Partial<Team>) => void;
  addPlayer: (data: Omit<Player, 'id' | 'timeId' | 'estatisticas' | 'criadoEm'>) => Player;
  updatePlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  linkPlayerAccount: (playerId: string, userUid: string) => void;
  joinTeamWithInviteCode: (code: string) => { success: boolean; message: string; team?: Team };
  createMatch: (data: Omit<Match, 'id' | 'timeId'>) => Match;
  updateMatchResult: (matchId: string, result: MatchResult) => void;
  createTraining: (data: Omit<Training, 'id' | 'timeId'>) => Training;
  saveLineup: (lineup: Lineup) => void;
  publishLineup: (lineupId: string) => void;
  setAttendance: (
    eventoTipo: 'partida' | 'treino',
    eventoId: string,
    jogadorId: string,
    status: AttendanceStatus,
    justificativa?: string
  ) => void;
  saveTactic: (data: Omit<Tactic, 'id' | 'timeId' | 'criadaEm'>) => Tactic;
  resetToInitialData: () => void;
  activeLineup: Lineup | null;
  getLineupForMatch: (matchId?: string) => Lineup | null;
}

const STORAGE_KEY = 'meutime_manager_data_v1';

// Initial Seed Data
const INITIAL_USERS: AppUser[] = [
  {
    uid: 'u-coach-1',
    nome: 'Prof. Carlos Mendes',
    email: 'carlos.mendes@meutime.com',
    role: 'tecnico',
    timeVinculadoId: 't-gavioes-1',
  },
  {
    uid: 'u-player-1',
    nome: 'Gabriel Silva',
    email: 'gabriel.silva@meutime.com',
    role: 'jogador',
    timeVinculadoId: 't-gavioes-1',
    jogadorVinculadoId: 'p-10',
  },
  {
    uid: 'u-player-2',
    nome: 'Lucas Lima',
    email: 'lucas.lima@meutime.com',
    role: 'jogador',
    timeVinculadoId: 't-gavioes-1',
    jogadorVinculadoId: 'p-7',
  },
  {
    uid: 'u-coach-2',
    nome: 'Coach Marcos Souza',
    email: 'marcos.souza@meutime.com',
    role: 'tecnico',
    timeVinculadoId: 't-trovao-2',
  },
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 't-gavioes-1',
    nome: 'Gaviões da Vila F.C.',
    esporte: 'futebol',
    modalidade: 'futebol_campo',
    escudoUrl: '/src/assets/images/meutime_crest_logo_1791998120853.jpg',
    tecnicoUid: 'u-coach-1',
    tecnicoNome: 'Prof. Carlos Mendes',
    codigoConvite: 'GV-2026',
    cidade: 'São Paulo, SP',
    fundacao: '2021',
    cores: {
      primary: '#0B2545',
      secondary: '#134074',
      text: '#EEF4F8',
    },
  },
  {
    id: 't-trovao-2',
    nome: 'Trovão Basquete Clube',
    esporte: 'basquete',
    modalidade: 'basquete_5x5',
    escudoUrl: '/src/assets/images/meutime_crest_logo_1791998120853.jpg',
    tecnicoUid: 'u-coach-2',
    tecnicoNome: 'Coach Marcos Souza',
    codigoConvite: 'TBC-305',
    cidade: 'Campinas, SP',
    fundacao: '2023',
    cores: {
      primary: '#B45309',
      secondary: '#D97706',
      text: '#FFFBEB',
    },
  },
];

const INITIAL_PLAYERS: Player[] = [
  // Gaviões da Vila players
  {
    id: 'p-1',
    timeId: 't-gavioes-1',
    nome: 'Danilo Alcantara',
    apelido: 'Paredão',
    numero: 1,
    posicao: 'GOL',
    posicaoSecundaria: undefined,
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 98765-4321',
    estatisticas: { jogos: 14, gols: 0, assistencias: 1, cartoesAmarelos: 1, cartoesVermelhos: 0, presencaPct: 92 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-2',
    timeId: 't-gavioes-1',
    nome: 'Bruno Carvalho',
    apelido: 'Brunão',
    numero: 3,
    posicao: 'ZAG',
    posicaoSecundaria: 'VOL',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 98123-4567',
    estatisticas: { jogos: 12, gols: 2, assistencias: 0, cartoesAmarelos: 3, cartoesVermelhos: 0, presencaPct: 88 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-3',
    timeId: 't-gavioes-1',
    nome: 'Rodrigo Medeiros',
    apelido: 'Digão',
    numero: 4,
    posicao: 'ZAG',
    peDominante: 'Canhoto',
    status: 'ativo',
    telefone: '(11) 97654-3210',
    estatisticas: { jogos: 13, gols: 1, assistencias: 1, cartoesAmarelos: 2, cartoesVermelhos: 0, presencaPct: 90 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-4',
    timeId: 't-gavioes-1',
    nome: 'Felipe Rocha',
    apelido: 'Felipinho',
    numero: 2,
    posicao: 'LD',
    posicaoSecundaria: 'MC',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 99876-1234',
    estatisticas: { jogos: 11, gols: 0, assistencias: 4, cartoesAmarelos: 2, cartoesVermelhos: 0, presencaPct: 79 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-5',
    timeId: 't-gavioes-1',
    nome: 'Thiago Oliveira',
    apelido: 'Thithi',
    numero: 6,
    posicao: 'LE',
    peDominante: 'Canhoto',
    status: 'ativo',
    telefone: '(11) 98456-7890',
    estatisticas: { jogos: 14, gols: 1, assistencias: 5, cartoesAmarelos: 1, cartoesVermelhos: 0, presencaPct: 95 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-6',
    timeId: 't-gavioes-1',
    nome: 'André Ramos',
    apelido: 'Pitbull',
    numero: 5,
    posicao: 'VOL',
    posicaoSecundaria: 'ZAG',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 99123-8877',
    estatisticas: { jogos: 15, gols: 1, assistencias: 2, cartoesAmarelos: 4, cartoesVermelhos: 1, presencaPct: 94 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-7',
    timeId: 't-gavioes-1',
    usuarioUid: 'u-player-2', // Conta vinculada
    nome: 'Lucas Lima',
    apelido: 'Luquinhas',
    numero: 7,
    posicao: 'PD',
    posicaoSecundaria: 'PE',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 97788-9900',
    estatisticas: { jogos: 15, gols: 8, assistencias: 9, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 100 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-8',
    timeId: 't-gavioes-1',
    nome: 'Renan Barreto',
    numero: 8,
    posicao: 'MC',
    posicaoSecundaria: 'VOL',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 96543-2109',
    estatisticas: { jogos: 13, gols: 3, assistencias: 6, cartoesAmarelos: 1, cartoesVermelhos: 0, presencaPct: 86 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-9',
    timeId: 't-gavioes-1',
    nome: 'Matheus Queiroz',
    apelido: 'Goleador',
    numero: 9,
    posicao: 'CA',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 95432-1098',
    estatisticas: { jogos: 14, gols: 14, assistencias: 3, cartoesAmarelos: 1, cartoesVermelhos: 0, presencaPct: 92 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-10',
    timeId: 't-gavioes-1',
    usuarioUid: 'u-player-1', // Conta vinculada
    nome: 'Gabriel Silva',
    apelido: 'Gabi 10',
    numero: 10,
    posicao: 'MEI',
    posicaoSecundaria: 'MC',
    peDominante: 'Canhoto',
    status: 'ativo',
    telefone: '(11) 99321-4567',
    estatisticas: { jogos: 15, gols: 11, assistencias: 12, cartoesAmarelos: 1, cartoesVermelhos: 0, presencaPct: 98 },
    criadoEm: '2026-01-10',
  },
  {
    id: 'p-11',
    timeId: 't-gavioes-1',
    nome: 'Vinicius Prado',
    apelido: 'Vini',
    numero: 11,
    posicao: 'PE',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 94321-0987',
    estatisticas: { jogos: 12, gols: 6, assistencias: 4, cartoesAmarelos: 2, cartoesVermelhos: 0, presencaPct: 84 },
    criadoEm: '2026-01-10',
  },
  // Reservas
  {
    id: 'p-12',
    timeId: 't-gavioes-1',
    nome: 'Guilherme Souza',
    numero: 12,
    posicao: 'GOL',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 93210-9876',
    estatisticas: { jogos: 3, gols: 0, assistencias: 0, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 75 },
    criadoEm: '2026-01-15',
  },
  {
    id: 'p-13',
    timeId: 't-gavioes-1',
    nome: 'Caio Junqueira',
    numero: 13,
    posicao: 'ZAG',
    peDominante: 'Destro',
    status: 'lesionado',
    telefone: '(11) 92109-8765',
    estatisticas: { jogos: 5, gols: 0, assistencias: 0, cartoesAmarelos: 1, cartoesVermelhos: 0, presencaPct: 60 },
    criadoEm: '2026-01-15',
  },
  {
    id: 'p-14',
    timeId: 't-gavioes-1',
    nome: 'Arthur Peixoto',
    numero: 14,
    posicao: 'MC',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(11) 91098-7654',
    estatisticas: { jogos: 7, gols: 1, assistencias: 2, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 80 },
    criadoEm: '2026-01-20',
  },
  {
    id: 'p-15',
    timeId: 't-gavioes-1',
    nome: 'Enzo Ferrari',
    numero: 19,
    posicao: 'CA',
    peDominante: 'Canhoto',
    status: 'ativo',
    telefone: '(11) 90987-6543',
    estatisticas: { jogos: 8, gols: 4, assistencias: 1, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 78 },
    criadoEm: '2026-01-22',
  },

  // Trovão Basquete players
  {
    id: 'pb-1',
    timeId: 't-trovao-2',
    nome: 'Leonardo Dantas',
    apelido: 'Leo Magic',
    numero: 5,
    posicao: 'PG',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(19) 98877-6655',
    estatisticas: { jogos: 8, gols: 96, assistencias: 52, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 100 },
    criadoEm: '2026-02-01',
  },
  {
    id: 'pb-2',
    timeId: 't-trovao-2',
    nome: 'Murilo Costa',
    apelido: 'Sniper',
    numero: 11,
    posicao: 'SG',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(19) 97766-5544',
    estatisticas: { jogos: 8, gols: 142, assistencias: 22, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 95 },
    criadoEm: '2026-02-01',
  },
  {
    id: 'pb-3',
    timeId: 't-trovao-2',
    nome: 'Diego Fernandes',
    apelido: 'Flash',
    numero: 23,
    posicao: 'SF',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(19) 96655-4433',
    estatisticas: { jogos: 7, gols: 84, assistencias: 18, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 90 },
    criadoEm: '2026-02-01',
  },
  {
    id: 'pb-4',
    timeId: 't-trovao-2',
    nome: 'Rafael Nogueira',
    apelido: 'Trator',
    numero: 34,
    posicao: 'PF',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(19) 95544-3322',
    estatisticas: { jogos: 8, gols: 110, assistencias: 14, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 92 },
    criadoEm: '2026-02-01',
  },
  {
    id: 'pb-5',
    timeId: 't-trovao-2',
    nome: 'Gustavo Santos',
    apelido: 'Gigante',
    numero: 42,
    posicao: 'C',
    peDominante: 'Destro',
    status: 'ativo',
    telefone: '(19) 94433-2211',
    estatisticas: { jogos: 8, gols: 120, assistencias: 10, cartoesAmarelos: 0, cartoesVermelhos: 0, presencaPct: 94 },
    criadoEm: '2026-02-01',
  },
];

const INITIAL_MATCHES: Match[] = [
  {
    id: 'm-1',
    timeId: 't-gavioes-1',
    adversario: 'Estrela Real F.C.',
    data: '2026-10-18',
    horario: '09:30',
    local: 'Arena Grêmio Vila Mariana - Campo 1',
    tipo: 'campeonato',
    status: 'agendada',
    observacoes: 'Uniforme 1 (Azul Marinho). Levar caneleira obrigatória. Chegar com 40 min de antecedência.',
    escalacaoId: 'lineup-gavioes-1',
  },
  {
    id: 'm-2',
    timeId: 't-gavioes-1',
    adversario: 'Unidos da Leste',
    data: '2026-10-25',
    horario: '11:00',
    local: 'Centro Esportivo Pelezão',
    tipo: 'campeonato',
    status: 'agendada',
    observacoes: 'Semifinal da Copa de Bairro. Partida única eliminatória.',
  },
  {
    id: 'm-0',
    timeId: 't-gavioes-1',
    adversario: 'Resenha Esporte Clube',
    data: '2026-10-04',
    horario: '10:00',
    local: 'Estádio Municipal de Práticas',
    tipo: 'amistoso',
    status: 'finalizada',
    resultado: {
      placarTime: 4,
      placarAdversario: 2,
      golsMarcados: [
        { jogadorId: 'p-9', jogadorNome: 'Matheus Queiroz', minuto: "18'" },
        { jogadorId: 'p-10', jogadorNome: 'Gabriel Silva', minuto: "34'" },
        { jogadorId: 'p-7', jogadorNome: 'Lucas Lima', minuto: "61'" },
        { jogadorId: 'p-10', jogadorNome: 'Gabriel Silva', minuto: "82'" },
      ],
      destaqueJogadorId: 'p-10',
      observacaoPosJogo: 'Ótima transição ofensiva. Destaque para o Gabriel Silva com 2 gols e 1 assistência.',
    },
    observacoes: 'Jogo de preparação para a Copa de Bairro.',
  },
];

const INITIAL_TRAININGS: Training[] = [
  {
    id: 'tr-1',
    timeId: 't-gavioes-1',
    titulo: 'Treino Tático & Posicionamento de Linhas',
    data: '2026-10-16',
    horario: '19:30',
    local: 'Campo Sintético Vila Mariana',
    foco: 'tatico',
    descricao: 'Ensaiar saída de bola contra pressão alta e cobranças de faltas laterais e escanteios.',
  },
  {
    id: 'tr-2',
    timeId: 't-gavioes-1',
    titulo: 'Coletivo Apronto & Finalizações',
    data: '2026-10-17',
    horario: '08:00',
    local: 'Campo Municipal 2',
    foco: 'coletivo',
    descricao: 'Ajuste fino da escalação titular para o clássico de domingo.',
  },
];

const INITIAL_LINEUPS: Lineup[] = [
  {
    id: 'lineup-gavioes-1',
    timeId: 't-gavioes-1',
    partidaId: 'm-1',
    esporte: 'futebol',
    modalidade: 'futebol_campo',
    formacao: '4-3-3',
    titulares: [
      { slotId: 'slot-1', positionName: 'GOL', x: 50, y: 88, jogadorId: 'p-1' },
      { slotId: 'slot-2', positionName: 'LE', x: 16, y: 72, jogadorId: 'p-5' },
      { slotId: 'slot-3', positionName: 'ZAG', x: 38, y: 75, jogadorId: 'p-2' },
      { slotId: 'slot-4', positionName: 'ZAG', x: 62, y: 75, jogadorId: 'p-3' },
      { slotId: 'slot-5', positionName: 'LD', x: 84, y: 72, jogadorId: 'p-4' },
      { slotId: 'slot-6', positionName: 'VOL', x: 50, y: 56, jogadorId: 'p-6' },
      { slotId: 'slot-7', positionName: 'MC', x: 30, y: 44, jogadorId: 'p-8' },
      { slotId: 'slot-8', positionName: 'MC', x: 70, y: 44, jogadorId: 'p-10' },
      { slotId: 'slot-9', positionName: 'PE', x: 18, y: 22, jogadorId: 'p-11' },
      { slotId: 'slot-10', positionName: 'CA', x: 50, y: 16, jogadorId: 'p-9' },
      { slotId: 'slot-11', positionName: 'PD', x: 82, y: 22, jogadorId: 'p-7' },
    ],
    reservasIds: ['p-12', 'p-14', 'p-15'],
    publicada: true,
    atualizadoEm: '2026-10-14T09:00:00Z',
  },
];

const INITIAL_TACTICS: Tactic[] = [
  {
    id: 'tac-1',
    timeId: 't-gavioes-1',
    modalidade: 'futebol_campo',
    titulo: 'Pressão Alta & Transição Veloz',
    formacao: '4-3-3',
    mentalidade: 'Ofensiva',
    pressao: 'Alta',
    instrucoes: [
      'Goleiro joga adiantado como líbero na cobertura da linha de zaga.',
      'Laterais sobem alternados: quando o esquerdo apoia, o direito fecha como terceiro zagueiro.',
      'Meia 10 (Gabriel Silva) tem liberdade criativa de circulação.',
      'Pontas fazem facão em diagonal em direção à área.',
    ],
    criadaEm: '2026-09-15',
  },
  {
    id: 'tac-2',
    timeId: 't-gavioes-1',
    modalidade: 'futebol_campo',
    titulo: 'Bloco Médio e Contra-Ataque',
    formacao: '4-4-2',
    mentalidade: 'Equilibrada',
    pressao: 'Média',
    instrucoes: [
      'Linhas compactas de 4 com no máximo 25 metros de distância.',
      'Retomada de bola aciona imediatamente os velocistas pelas pontas.',
      'Evitar faltas na entrada da grande área.',
    ],
    criadaEm: '2026-09-20',
  },
];

const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 'att-1', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-1', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-2', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-2', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-3', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-3', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-4', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-4', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-5', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-5', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-6', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-6', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-7', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-7', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-8', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-8', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-9', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-9', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-10', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-10', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-11', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-11', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-12', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-12', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-13', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-13', status: 'recusado', justificativa: 'Em fisioterapia por lesão no tornozelo.', atualizadoEm: '2026-10-13' },
  { id: 'att-14', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-14', status: 'duvida', justificativa: 'Plantão no trabalho até 08h, confirmo até sexta.', atualizadoEm: '2026-10-14' },
  { id: 'att-15', timeId: 't-gavioes-1', eventoTipo: 'partida', eventoId: 'm-1', jogadorId: 'p-15', status: 'confirmado', atualizadoEm: '2026-10-14' },

  // Treino attendance
  { id: 'att-tr-1', timeId: 't-gavioes-1', eventoTipo: 'treino', eventoId: 'tr-1', jogadorId: 'p-10', status: 'confirmado', atualizadoEm: '2026-10-14' },
  { id: 'att-tr-2', timeId: 't-gavioes-1', eventoTipo: 'treino', eventoId: 'tr-1', jogadorId: 'p-7', status: 'confirmado', atualizadoEm: '2026-10-14' },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<AppUser[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('u-coach-1');
  const [activeTeamId, setActiveTeamId] = useState<string>('t-gavioes-1');

  // Stored state
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_teams`);
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_players`);
      return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_matches`);
      return saved ? JSON.parse(saved) : INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  });

  const [trainings, setTrainings] = useState<Training[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_trainings`);
      return saved ? JSON.parse(saved) : INITIAL_TRAININGS;
    } catch {
      return INITIAL_TRAININGS;
    }
  });

  const [lineups, setLineups] = useState<Lineup[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_lineups`);
      return saved ? JSON.parse(saved) : INITIAL_LINEUPS;
    } catch {
      return INITIAL_LINEUPS;
    }
  });

  const [tactics, setTactics] = useState<Tactic[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tactics`);
      return saved ? JSON.parse(saved) : INITIAL_TACTICS;
    } catch {
      return INITIAL_TACTICS;
    }
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_attendances`);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_teams`, JSON.stringify(teams));
      localStorage.setItem(`${STORAGE_KEY}_players`, JSON.stringify(players));
      localStorage.setItem(`${STORAGE_KEY}_matches`, JSON.stringify(matches));
      localStorage.setItem(`${STORAGE_KEY}_trainings`, JSON.stringify(trainings));
      localStorage.setItem(`${STORAGE_KEY}_lineups`, JSON.stringify(lineups));
      localStorage.setItem(`${STORAGE_KEY}_tactics`, JSON.stringify(tactics));
      localStorage.setItem(`${STORAGE_KEY}_attendances`, JSON.stringify(attendances));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [teams, players, matches, trainings, lineups, tactics, attendances]);

  const currentUser = users.find((u) => u.uid === currentUserId) || users[0];
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0] || null;

  // Active lineup for the team (or creates a blank one based on current modality)
  const activeLineup =
    lineups.find((l) => l.timeId === activeTeam?.id && l.publicada) ||
    lineups.find((l) => l.timeId === activeTeam?.id) ||
    null;

  const getLineupForMatch = (matchId?: string) => {
    if (!activeTeam) return null;
    if (matchId) {
      return lineups.find((l) => l.partidaId === matchId) || null;
    }
    return activeLineup;
  };

  // UC01: Criar equipe
  const createTeam = async (
    data: Omit<Team, 'id' | 'tecnicoUid' | 'tecnicoNome' | 'codigoConvite'>
  ): Promise<Team> => {
    const id = `team-${Date.now()}`;
    const randomCode = `${data.nome.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newTeam: Team = {
      ...data,
      id,
      tecnicoUid: currentUser.uid,
      tecnicoNome: currentUser.nome,
      codigoConvite: randomCode,
    };

    setTeams((prev) => [newTeam, ...prev]);
    setActiveTeamId(id);

    // Also auto-initialize a default lineup template for this team's modality
    const config = MODALITIES_CONFIG[data.modalidade];
    const defaultForm = config.formations[0];
    const defaultLineup: Lineup = {
      id: `lineup-${id}-default`,
      timeId: id,
      esporte: data.esporte,
      modalidade: data.modalidade,
      formacao: defaultForm.name,
      titulares: defaultForm.slots.map((s) => ({
        slotId: s.id,
        positionName: s.position,
        x: s.x,
        y: s.y,
        jogadorId: undefined,
      })),
      reservasIds: [],
      publicada: false,
      atualizadoEm: new Date().toISOString(),
    };
    setLineups((prev) => [...prev, defaultLineup]);

    return newTeam;
  };

  const updateTeam = (teamId: string, data: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, ...data } : t)));
  };

  // UC02: Cadastrar jogador manual
  const addPlayer = (
    data: Omit<Player, 'id' | 'timeId' | 'estatisticas' | 'criadoEm'>
  ): Player => {
    if (!activeTeam) throw new Error('Nenhum time ativo selecionado');

    // Rule RN05: Check duplicated shirt number in active team
    const numberExists = players.some(
      (p) => p.timeId === activeTeam.id && p.numero === data.numero
    );
    if (numberExists) {
      throw new Error(`O número de camisa #${data.numero} já está em uso nesta equipe.`);
    }

    const newPlayer: Player = {
      ...data,
      id: `p-${Date.now()}`,
      timeId: activeTeam.id,
      estatisticas: {
        jogos: 0,
        gols: 0,
        assistencias: 0,
        cartoesAmarelos: 0,
        cartoesVermelhos: 0,
        presencaPct: 100,
      },
      criadoEm: new Date().toISOString().split('T')[0],
    };

    setPlayers((prev) => [...prev, newPlayer]);
    return newPlayer;
  };

  const updatePlayer = (player: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === player.id ? player : p)));
  };

  // RN11: Jogadores removidos mantêm histórico, mas saem do elenco ativo
  const removePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    // Also remove from any lineups
    setLineups((prev) =>
      prev.map((l) => ({
        ...l,
        titulares: l.titulares.map((t) =>
          t.jogadorId === playerId ? { ...t, jogadorId: undefined } : t
        ),
        reservasIds: l.reservasIds.filter((id) => id !== playerId),
      }))
    );
  };

  // UC03: Vincular conta de jogador
  const linkPlayerAccount = (playerId: string, userUid: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, usuarioUid: userUid } : p))
    );
  };

  // UC03: Entrar em time via código de convite
  const joinTeamWithInviteCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const team = teams.find((t) => t.codigoConvite.toUpperCase() === trimmed);
    if (!team) {
      return { success: false, message: 'Código de convite não encontrado.' };
    }

    // Connect user to team
    currentUser.timeVinculadoId = team.id;
    setActiveTeamId(team.id);

    return {
      success: true,
      message: `Bem-vindo(a) ao ${team.nome}!`,
      team,
    };
  };

  // Partidas & Treinos
  const createMatch = (data: Omit<Match, 'id' | 'timeId'>): Match => {
    if (!activeTeam) throw new Error('Nenhum time ativo selecionado');
    const newMatch: Match = {
      ...data,
      id: `match-${Date.now()}`,
      timeId: activeTeam.id,
    };
    setMatches((prev) => [newMatch, ...prev]);
    return newMatch;
  };

  const updateMatchResult = (matchId: string, result: MatchResult) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: 'finalizada',
              resultado: result,
            }
          : m
      )
    );

    // Update player stats for goals
    if (result.golsMarcados && result.golsMarcados.length > 0) {
      const counts: Record<string, number> = {};
      result.golsMarcados.forEach((g) => {
        counts[g.jogadorId] = (counts[g.jogadorId] || 0) + 1;
      });

      setPlayers((prev) =>
        prev.map((p) => {
          if (counts[p.id]) {
            return {
              ...p,
              estatisticas: {
                ...p.estatisticas,
                jogos: p.estatisticas.jogos + 1,
                gols: p.estatisticas.gols + counts[p.id],
              },
            };
          }
          return p;
        })
      );
    }
  };

  const createTraining = (data: Omit<Training, 'id' | 'timeId'>): Training => {
    if (!activeTeam) throw new Error('Nenhum time ativo selecionado');
    const newTraining: Training = {
      ...data,
      id: `tr-${Date.now()}`,
      timeId: activeTeam.id,
    };
    setTrainings((prev) => [newTraining, ...prev]);
    return newTraining;
  };

  // UC04: Montar escalação e RN09, RN10
  const saveLineup = (lineup: Lineup) => {
    setLineups((prev) => {
      const exists = prev.some((l) => l.id === lineup.id);
      if (exists) {
        return prev.map((l) => (l.id === lineup.id ? { ...lineup, atualizadoEm: new Date().toISOString() } : l));
      }
      return [lineup, ...prev];
    });
  };

  // RF16: Publicar escalação
  const publishLineup = (lineupId: string) => {
    setLineups((prev) =>
      prev.map((l) =>
        l.id === lineupId
          ? { ...l, publicada: true, atualizadoEm: new Date().toISOString() }
          : l
      )
    );
  };

  // UC05: Confirmar presença
  const setAttendance = (
    eventoTipo: 'partida' | 'treino',
    eventoId: string,
    jogadorId: string,
    status: AttendanceStatus,
    justificativa?: string
  ) => {
    if (!activeTeam) return;
    setAttendances((prev) => {
      const filtered = prev.filter(
        (a) => !(a.eventoId === eventoId && a.jogadorId === jogadorId && a.eventoTipo === eventoTipo)
      );
      const newAttendance: Attendance = {
        id: `att-${Date.now()}`,
        timeId: activeTeam.id,
        eventoTipo,
        eventoId,
        jogadorId,
        status,
        justificativa,
        atualizadoEm: new Date().toISOString().split('T')[0],
      };
      return [...filtered, newAttendance];
    });
  };

  // RF15: Criar e salvar táticas
  const saveTactic = (data: Omit<Tactic, 'id' | 'timeId' | 'criadaEm'>): Tactic => {
    if (!activeTeam) throw new Error('Nenhum time ativo selecionado');
    const newTactic: Tactic = {
      ...data,
      id: `tac-${Date.now()}`,
      timeId: activeTeam.id,
      criadaEm: new Date().toISOString().split('T')[0],
    };
    setTactics((prev) => [newTactic, ...prev]);
    return newTactic;
  };

  const resetToInitialData = () => {
    setTeams(INITIAL_TEAMS);
    setPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setTrainings(INITIAL_TRAININGS);
    setLineups(INITIAL_LINEUPS);
    setTactics(INITIAL_TACTICS);
    setAttendances(INITIAL_ATTENDANCE);
    setActiveTeamId('t-gavioes-1');
    setCurrentUserId('u-coach-1');
    localStorage.removeItem(`${STORAGE_KEY}_teams`);
    localStorage.removeItem(`${STORAGE_KEY}_players`);
    localStorage.removeItem(`${STORAGE_KEY}_matches`);
    localStorage.removeItem(`${STORAGE_KEY}_trainings`);
    localStorage.removeItem(`${STORAGE_KEY}_lineups`);
    localStorage.removeItem(`${STORAGE_KEY}_tactics`);
    localStorage.removeItem(`${STORAGE_KEY}_attendances`);
  };

  const setCurrentUser = (user: AppUser) => {
    setCurrentUserId(user.uid);
    if (user.timeVinculadoId) {
      setActiveTeamId(user.timeVinculadoId);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        activeTeam,
        setActiveTeamId,
        teams,
        players,
        matches,
        trainings,
        lineups,
        tactics,
        attendances,
        createTeam,
        updateTeam,
        addPlayer,
        updatePlayer,
        removePlayer,
        linkPlayerAccount,
        joinTeamWithInviteCode,
        createMatch,
        updateMatchResult,
        createTraining,
        saveLineup,
        publishLineup,
        setAttendance,
        saveTactic,
        resetToInitialData,
        activeLineup,
        getLineupForMatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

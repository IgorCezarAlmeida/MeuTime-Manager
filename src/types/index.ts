export type SportId = 'futebol' | 'futsal' | 'basquete';

export type ModalityId = 
  | 'futebol_campo' 
  | 'futebol_7' 
  | 'futsal' 
  | 'basquete_3x3' 
  | 'basquete_5x5';

export interface PositionInfo {
  id: string;
  name: string;
  shortName: string;
  category: 'goleiro' | 'defesa' | 'meio' | 'ataque' | 'armacao' | 'ala' | 'pivo';
}

export interface FormationTemplate {
  name: string;
  label: string;
  description: string;
  slots: {
    id: string;
    position: string;
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    label: string;
  }[];
}

export interface ModalityConfig {
  sportId: SportId;
  modalityId: ModalityId;
  name: string;
  sportName: string;
  maxStarters: number;
  recommendedSquad: number;
  courtType: 'grama' | 'sintetico' | 'madeira' | 'street';
  positions: PositionInfo[];
  formations: FormationTemplate[];
}

export type UserRole = 'tecnico' | 'jogador';

export interface AppUser {
  uid: string;
  nome: string;
  email: string;
  role: UserRole;
  fotoUrl?: string;
  timeVinculadoId?: string;
  jogadorVinculadoId?: string;
}

export interface TeamColors {
  primary: string;
  secondary: string;
  text: string;
}

export interface Team {
  id: string;
  nome: string;
  esporte: SportId;
  modalidade: ModalityId;
  escudoUrl?: string;
  tecnicoUid: string;
  tecnicoNome: string;
  codigoConvite: string;
  cidade: string;
  fundacao: string;
  cores: TeamColors;
}

export type PlayerStatus = 'ativo' | 'lesionado' | 'suspenso';
export type DominantSide = 'Destro' | 'Canhoto' | 'Ambidestro';

export interface PlayerStats {
  jogos: number;
  gols: number; // ou cestas/pontos no basquete
  assistencias: number;
  cartoesAmarelos?: number;
  cartoesVermelhos?: number;
  presencaPct: number;
}

export interface Player {
  id: string;
  timeId: string;
  usuarioUid?: string; // associado com conta
  nome: string;
  apelido?: string;
  numero: number;
  posicao: string;
  posicaoSecundaria?: string;
  peDominante?: DominantSide;
  status: PlayerStatus;
  telefone?: string;
  estatisticas: PlayerStats;
  criadoEm: string;
}

export type MatchType = 'amistoso' | 'campeonato' | 'torneio' | 'eliminatoria';
export type MatchStatus = 'agendada' | 'finalizada' | 'cancelada';

export interface GoalEvent {
  jogadorId: string;
  jogadorNome: string;
  minuto?: string;
}

export interface MatchResult {
  placarTime: number;
  placarAdversario: number;
  golsMarcados?: GoalEvent[];
  destaqueJogadorId?: string;
  observacaoPosJogo?: string;
}

export interface Match {
  id: string;
  timeId: string;
  adversario: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  local: string;
  tipo: MatchType;
  status: MatchStatus;
  resultado?: MatchResult;
  observacoes?: string;
  escalacaoId?: string;
}

export type TrainingFocus = 'tatico' | 'fisico' | 'tecnico' | 'coletivo';

export interface Training {
  id: string;
  timeId: string;
  titulo: string;
  data: string;
  horario: string;
  local: string;
  foco: TrainingFocus;
  descricao?: string;
}

export interface TacticalSlot {
  slotId: string;
  positionName: string;
  x: number; // percentage
  y: number; // percentage
  jogadorId?: string;
}

export interface Lineup {
  id: string;
  timeId: string;
  partidaId?: string;
  esporte: SportId;
  modalidade: ModalityId;
  formacao: string;
  titulares: TacticalSlot[];
  reservasIds: string[];
  publicada: boolean;
  atualizadoEm: string;
}

export interface Tactic {
  id: string;
  timeId: string;
  modalidade: ModalityId;
  titulo: string;
  formacao: string;
  mentalidade: 'Defensiva' | 'Equilibrada' | 'Ofensiva';
  pressao: 'Baixa' | 'Média' | 'Alta';
  instrucoes: string[];
  criadaEm: string;
}

export type AttendanceStatus = 'confirmado' | 'recusado' | 'duvida';

export interface Attendance {
  id: string;
  timeId: string;
  eventoTipo: 'partida' | 'treino';
  eventoId: string;
  jogadorId: string;
  status: AttendanceStatus;
  justificativa?: string;
  atualizadoEm: string;
}

# MeuTime Manager — Arquitetura CRUD em React Native + TypeScript + Firebase

Este documento detalha a implementação completa da camada de dados, regras de negócio e interfaces **CRUD em React Native** para o projeto **MeuTime Manager**, estruturado rigorosamente de acordo com o **Documento de Engenharia de Software**.

---

## 1. Visão Geral da Arquitetura

O sistema adota uma arquitetura em camadas desacopladas e extensíveis:

```text
┌────────────────────────────────────────────────────────┐
│             UI / Telas React Native (Android)          │
│  LoginScreen | RegisterScreen | TeamSetupScreen        │
│  RosterScreen | CalendarScreen | LineupScreen          │
│  TacticsScreen | AttendanceScreen | SportPitch         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ↓
┌────────────────────────────────────────────────────────┐
│            Camada de Hooks / Controllers               │
│  useAuth | useTeam | usePlayers | useMatches           │
│  useTrainings | useLineup | useTactics | useAttendance │
└───────────────────────────┬────────────────────────────┘
                            │
                            ↓
┌────────────────────────────────────────────────────────┐
│        Camada de Serviços Firebase (Data Layer)        │
│  authService | teamService | playerService             │
│  matchService | trainingService | lineupService        │
│  tacticService | attendanceService | storageService    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ↓
┌────────────────────────────────────────────────────────┐
│              Serviços Cloud do Firebase                │
│  Firebase Authentication (UIDs, tokens, senhas)        │
│  Cloud Firestore (8 coleções tipadas)                  │
│  Firebase Cloud Storage (Escudos e Fotos)              │
│  Firestore Security Rules (RN06, RN07, RN12)           │
└────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Diretórios Criada

```text
meutime-manager/
├── firestore.rules               # Regras de segurança de produção do Cloud Firestore
├── storage.rules                 # Regras de segurança do Cloud Storage
├── firestore.indexes.json        # Índices compostos para consultas
├── firebase.json                 # Configuração do Firebase CLI
├── app.json                      # Configuração do Expo / React Native Android
│
└── src/
    ├── types/
    │   └── index.ts              # Modelos tipados (Team, Player, Match, Lineup, Tactic, etc.)
    ├── constants/
    │   └── sports.ts             # Configuração extensível de modalidades esportivas
    │
    └── react-native/             # Módulo React Native completo
        ├── index.ts              # Barrel export de todo o ecossistema mobile
        ├── AppMobile.tsx         # Ponto de entrada da aplicação Android
        │
        ├── services/
        │   └── firebase/
        │       ├── config.ts             # Inicialização Singleton e referências
        │       ├── authService.ts        # RF01, RF02 (Login, Cadastro, Perfil)
        │       ├── teamService.ts        # RF03, RF04, RF09 (CRUD Time, Código de Convite)
        │       ├── playerService.ts      # RF05, RF06, RF08 (CRUD Elenco, Soft Delete RN11)
        │       ├── matchService.ts       # RF10, RF20, RF21, RF22 (CRUD Partidas, Resultados)
        │       ├── trainingService.ts    # RF11 (CRUD Treinos)
        │       ├── lineupService.ts      # RF12, RF13, RF14, RF16 (CRUD Escalação, Prancheta)
        │       ├── tacticService.ts      # RF15 (CRUD Táticas e Estratégias)
        │       ├── attendanceService.ts  # RF17, RF18, RF19 (Controle de Presença e Disponibilidade)
        │       ├── storageService.ts     # Upload de escudos e fotos
        │       └── index.ts
        │
        ├── hooks/
        │   ├── useAuth.ts                # Gestão de estado do usuário logado
        │   ├── useTeam.ts                # Gestão do time ativo e modalidade
        │   ├── usePlayers.ts             # Gestão do elenco e filtros de posição
        │   ├── useMatches.ts             # Gestão de partidas e histórico
        │   ├── useTrainings.ts           # Gestão de treinos
        │   ├── useLineup.ts              # Gestão tática interativa da escalação
        │   ├── useTactics.ts             # Gestão de táticas salvas
        │   ├── useAttendance.ts          # Controle de disponibilidade
        │   └── index.ts
        │
        ├── components/
        │   ├── CustomButton.tsx          # Botão com variantes (primary, outline, danger)
        │   ├── CustomInput.tsx           # Input com label, validação e dark theme
        │   ├── PlayerCard.tsx            # Card de atleta (número, posição, status, ações)
        │   ├── EventCard.tsx             # Card de partida / treino com placar e presenças
        │   ├── SportPitch.tsx            # Campo/Quadra dinâmico (Grama, Sintético, Madeira, 3x3)
        │   └── AttendanceModal.tsx       # Confirmação de presença ("Vou", "Não vou")
        │
        ├── screens/
        │   ├── Auth/
        │   │   ├── LoginScreen.tsx       # Tela de Login e Recuperação de Acesso
        │   │   └── RegisterScreen.tsx    # Cadastro com escolha de perfil (Técnico / Jogador)
        │   ├── Team/
        │   │   └── TeamSetupScreen.tsx   # UC01: Criar Equipe / Entrar com Convite
        │   ├── Roster/
        │   │   ├── RosterScreen.tsx      # UC02: Gestão do Elenco e Código de Convite
        │   │   └── PlayerFormModal.tsx   # Modal de criação/edição com posições dinâmicas
        │   ├── Calendar/
        │   │   ├── CalendarScreen.tsx    # Abas Partidas e Treinos
        │   │   ├── MatchFormModal.tsx    # RF10: Agendar Partida
        │   │   ├── MatchResultModal.tsx  # RF20: Registrar Placar, MVP e Resenha
        │   │   └── TrainingFormModal.tsx # RF11: Agendar Treinamento
        │   ├── Lineup/
        │   │   └── LineupScreen.tsx      # UC04, RF12, RF14, RF16: Prancheta tática visual
        │   ├── Tactics/
        │   │   └── TacticsScreen.tsx     # RF15: Criar e Salvar Táticas
        │   └── Attendance/
        │       └── AttendanceScreen.tsx  # UC05, RF19: Disponibilidade e confirmação
        │
        └── navigation/
            └── AppNavigator.tsx          # Bottom Tab Navigator adaptado ao perfil (Técnico vs Jogador)
```

---

## 3. Mapeamento de Requisitos Funcionais (RF) e Casos de Uso (UC)

| Requisito / Caso de Uso | Descrição | Módulo Implementado |
|---|---|---|
| **RF01 / RF02** | Cadastro e Autenticação de Usuários | `authService.ts`, `LoginScreen.tsx`, `RegisterScreen.tsx` |
| **RF03 / RF04 / UC01** | Criação de Equipe e Seleção de Esporte/Modalidade | `teamService.ts`, `TeamSetupScreen.tsx` |
| **RF05 / RF06 / UC02** | Cadastro Manual, Edição e Remoção de Jogadores | `playerService.ts`, `RosterScreen.tsx`, `PlayerFormModal.tsx` |
| **RF07 / RF08 / UC03** | Conta de Jogador e Vínculo com Cadastro Esportivo | `playerService.linkAccountToPlayer`, `RegisterScreen.tsx` |
| **RF09** | Envio de Convites aos Atletas (Código Único de 6 dígitos) | `teamService.createTeam`, `RosterScreen.tsx` |
| **RF10** | Cadastro de Partidas (Adversário, data, hora, local) | `matchService.ts`, `MatchFormModal.tsx` |
| **RF11** | Cadastro de Treinamentos (Foco, local, horário) | `trainingService.ts`, `TrainingFormModal.tsx` |
| **RF12 / RF13 / UC04** | Montagem de Escalação e Seleção de Formações | `lineupService.ts`, `LineupScreen.tsx`, `useLineup.ts` |
| **RF14** | Posicionamento de Jogadores no Campo/Quadra | `SportPitch.tsx` (coordenadas percentuais x%, y%) |
| **RF15** | Criar e Salvar Estratégias Táticas | `tacticService.ts`, `TacticsScreen.tsx` |
| **RF16** | Publicação de Escalação Oficial | `lineupService.publishLineup`, `LineupScreen.tsx` |
| **RF17 / RF18 / UC05** | Confirmação de Presença em Partidas e Treinos | `attendanceService.ts`, `AttendanceModal.tsx` |
| **RF19** | Consulta de Disponibilidade pelo Técnico | `attendanceService.getAttendanceByEvent`, `AttendanceScreen.tsx` |
| **RF20 / RF21 / RF22** | Registro de Resultados, Histórico e Estatísticas | `matchService.registerMatchResult`, `MatchResultModal.tsx` |
| **RF23** | Compartilhamento de Escalação Oficial via WhatsApp/Share | `LineupScreen.tsx` (via React Native `Share.share`) |
| **RF24** | Extensibilidade para Novas Modalidades | `constants/sports.ts` e arquitetura baseada em `ModalityConfig` |

---

## 4. Implementação das Regras de Negócio (RN)

- **RN01 / RN02:** Toda equipe possui `tecnicoUid` e `tecnicoNome` obrigatórios e modalidade selecionada (`teamService.createTeam`).
- **RN03 / RN04:** O técnico cadastra jogadores sem conta prévia. Posteriormente, o jogador vincula sua conta via `linkAccountToPlayer`.
- **RN05 & RNF09:** `playerService.addPlayer` e `updatePlayer` barram números duplicados de camisa no elenco ativo.
- **RN06 & RN07:** As regras em `firestore.rules` e os services garantem que apenas `tecnicoUid` edite a equipe e publique escalações.
- **RN08:** `attendanceService.setAttendance` registra presença ("Vou", "Não vou", "Dúvida") sem acoplar à titularidade.
- **RN09:** `lineupService.saveLineup` e `useLineup.assignStarter` impedem que um atleta ocupe 2 posições simultâneas ou esteja no banco e no campo ao mesmo tempo.
- **RN10:** O limite de titulares em campo é validado contra `modalityConfig.maxStarters` (11 no campo, 7 no society, 5 no futsal e basquete, 3 no basquete 3x3).
- **RN11:** Remoção de atletas executa **Soft Delete** (`status: 'inativo'`), preservando gols, partidas e histórico esportivo.
- **RN12:** `firestore.rules` proíbe leitura de dados de times aos quais o usuário não pertence.
- **RN13 / RN14 / RN15:** Formações e pranchetas táticas são validadas de acordo com a modalidade esportiva selecionada.

---

## 5. Estrutura das Coleções no Cloud Firestore

```text
usuarios/{uid}
├── uid: string
├── nome: string
├── email: string
├── role: 'tecnico' | 'jogador'
├── timeVinculadoId?: string
└── jogadorVinculadoId?: string

times/{timeId}
├── id: string
├── nome: string
├── esporte: 'futebol' | 'futsal' | 'basquete'
├── modalidade: 'futebol_campo' | 'futebol_7' | 'futsal' | 'basquete_3x3' | 'basquete_5x5'
├── tecnicoUid: string
├── tecnicoNome: string
├── codigoConvite: string (ex: 'GAV123')
├── cores: { primary, secondary, text }
└── escudoUrl?: string

jogadores/{jogadorId}
├── id: string
├── timeId: string
├── usuarioUid?: string
├── nome: string
├── apelido?: string
├── numero: number
├── posicao: string
├── status: 'ativo' | 'lesionado' | 'suspenso' | 'inativo'
└── estatisticas: { jogos, gols, assistencias, presencaPct }

partidas/{partidaId}
├── id: string
├── timeId: string
├── adversario: string
├── data: string (YYYY-MM-DD)
├── horario: string (HH:mm)
├── local: string
├── tipo: 'amistoso' | 'campeonato' | 'torneio' | 'eliminatoria'
├── status: 'agendada' | 'finalizada' | 'cancelada'
└── resultado?: { placarTime, placarAdversario, destaqueJogadorId, observacaoPosJogo }

treinos/{treinoId}
├── id: string
├── timeId: string
├── titulo: string
├── data: string
├── horario: string
├── local: string
├── foco: 'tatico' | 'fisico' | 'tecnico' | 'coletivo'
└── descricao?: string

escalacoes/{escalacaoId}
├── id: string
├── timeId: string
├── partidaId?: string
├── modalidade: ModalityId
├── formacao: string (ex: '4-3-3', '3-1', '1-2-2')
├── titulares: [{ slotId, positionName, x, y, jogadorId }]
├── reservasIds: string[]
└── publicada: boolean

taticas/{taticaId}
├── id: string
├── timeId: string
├── modalidade: ModalityId
├── titulo: string
├── formacao: string
├── mentalidade: 'Defensiva' | 'Equilibrada' | 'Ofensiva'
├── pressao: 'Baixa' | 'Média' | 'Alta'
└── instrucoes: string[]

presencas/{presencaId}  (ID padrão: {eventoTipo}_{eventoId}_{jogadorId})
├── id: string
├── timeId: string
├── eventoTipo: 'partida' | 'treino'
├── eventoId: string
├── jogadorId: string
├── status: 'confirmado' | 'recusado' | 'duvida'
└── justificativa?: string
```

---

## 6. Como Executar no Ambiente React Native / Android

### Opção A: Executar com Expo
```bash
# 1. Instalar dependências
npx expo install firebase @react-native-async-storage/async-storage

# 2. Iniciar o servidor de desenvolvimento
npx expo start --android
```

### Opção B: Deploy das Regras do Firebase
```bash
# Login no Firebase CLI
npx firebase login

# Selecionar o projeto MeuTime Manager
npx firebase use meutime-manager

# Publicar regras do Firestore e Storage
npx firebase deploy --only firestore:rules,storage
```

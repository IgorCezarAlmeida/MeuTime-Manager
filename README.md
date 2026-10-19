# MeuTime Manager ⚽🏀

> **Plataforma de Gestão de Equipes Esportivas Amadoras**  
> Desenvolvido em **React Native + TypeScript + Firebase** para Android.

---

## 📌 Sobre o Projeto

O **MeuTime Manager** é uma aplicação mobile focada em simplificar a organização e a gestão de equipes esportivas amadoras. Diferente de aplicações exclusivas para futebol, o sistema foi projetado com uma arquitetura modular extensível baseada no conceito de **esporte + modalidade**.

### 🏅 Modalidades Atendidas na V1
- **Futebol de Campo** (11 jogadores, formações 4-3-3, 4-4-2, 4-2-3-1, 3-5-2)
- **Futebol 7 / Society** (7 jogadores, formações 2-3-1, 3-2-1, 2-2-2)
- **Futsal** (5 jogadores, formações 3-1 Diamante, 2-2 Quadrado, 4-0)
- **Basquete 5x5** (5 jogadores, posições PG, SG, SF, PF, C; formações 1-2-2, 5-Out)
- **Basquete 3x3** (Meia quadra street, formações 1-2 e Perímetro Aberto)

---

## 🚀 Funcionalidades Principais (CRUD)

- **Gestão de Usuários & Autenticação (RF01, RF02):** Cadastro, login e recuperação de senha via Firebase Authentication com distinção de papéis (**Técnico** e **Jogador**).
- **Gestão da Equipe (UC01, RF03, RF04, RF09):** Criação de times, definição de esporte/modalidade, cores do uniforme e geração de código de convite único.
- **Gestão do Elenco (UC02, RF05, RF06, RF08):** Cadastro manual de atletas, validação contra números de camisa duplicados (RN05), vínculo com contas de jogadores (RN04) e remoção segura com *Soft Delete* preservando o histórico esportivo (RN11).
- **Partidas & Resultados (RF10, RF20, RF21, RF22):** Agendamento de jogos (amistosos, campeonatos, torneios), histórico completo, registro de placar, artilheiros e craque da partida (MVP).
- **Treinamentos (RF11):** Agendamento de treinos com foco específico (tático, físico, técnico, coletivo).
- **Escalação & Prancheta Tática (UC04, RF12, RF13, RF14, RF16, RF23):** Seleção de formações esportivas, posicionamento interativo no campo/quadra dinâmico (`SportPitch`), banco de reservas, publicação oficial e compartilhamento via WhatsApp/Share.
- **Controle de Presença (UC05, RF17, RF18, RF19):** Confirmação rápida pelos atletas (*"Vou"*, *"Não vou"*, *"Dúvida"*) sem acoplamento automático à titularidade (RN08) e painel de disponibilidade para o técnico.
- **Segurança (RN06, RN07, RN12):** Regras de segurança completas no Cloud Firestore (`firestore.rules`) e Cloud Storage (`storage.rules`).

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem:** TypeScript
- **Framework Mobile:** React Native (Android)
- **Backend as a Service:** Firebase
  - **Firebase Authentication:** Gestão segura de identidades
  - **Cloud Firestore:** Banco de dados NoSQL estruturado em 8 coleções
  - **Cloud Storage:** Armazenamento de escudos e fotos
  - **Security Rules:** Controle de acesso baseado em papéis e equipes

---

## 📂 Estrutura do Projeto

```text
meutime-manager/
├── firestore.rules               # Regras de segurança do Firestore (Produção)
├── storage.rules                 # Regras de segurança do Cloud Storage
├── firestore.indexes.json        # Índices compostos de banco de dados
├── app.json                      # Configuração do Expo / Android
├── REACT_NATIVE_CRUD.md          # Documentação detalhada da arquitetura CRUD
│
└── src/
    ├── types/                    # Modelos de dados e tipos TypeScript
    ├── constants/sports.ts       # Configurações de modalidades, posições e formações
    └── react-native/             # Módulo React Native
        ├── AppMobile.tsx         # Ponto de entrada mobile
        ├── services/firebase/    # Camada de serviços Firebase (Auth, Team, Player, Match, Lineup, etc.)
        ├── hooks/                # Custom Hooks (useAuth, useTeam, usePlayers, useLineup, etc.)
        ├── components/           # Componentes nativos (SportPitch, PlayerCard, EventCard, etc.)
        ├── screens/              # Telas nativas por domínio
        └── navigation/           # AppNavigator com Bottom Tab Bar baseado em papéis
```

---

## 📖 Documentação Completa da Arquitetura

Para detalhes completos dos Casos de Uso, Requisitos Funcionais, Regras de Negócio e esquemas de coleções do Firestore, consulte o arquivo [REACT_NATIVE_CRUD.md](./REACT_NATIVE_CRUD.md).

---

## 📄 Licença

Este projeto é desenvolvido para fins esportivos e de gestão amadora.

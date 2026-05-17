# 🌌 NightLedger

<p align="center">
  <img src="https://img.shields.io/github/license/lukk-valadao/NightLedger?color=8B5CF6&style=for-the-badge" alt="GitHub license" />
  <img src="https://img.shields.io/github/stars/lukk-valadao/NightLedger?color=F59E0B&style=for-the-badge" alt="GitHub stars" />
  <img src="https://img.shields.io/github/forks/lukk-valadao/NightLedger?color=10B981&style=for-the-badge" alt="GitHub forks" />
  <img src="https://img.shields.io/github/issues/lukk-valadao/NightLedger?color=EF4444&style=for-the-badge" alt="GitHub issues" />
</p>

> **Aplicativo web mobile-first de controle financeiro pessoal com rateio automático e proporcional de ganhos variáveis para profissionais autônomos.**

O **NightLedger** foi desenhado especificamente para substituir planilhas financeiras complexas de trabalhadores autônomos e freelancers (como motoristas de aplicativo, designers, desenvolvedores e profissionais com renda variável diária). Ele funciona como um **PWA (Progressive Web App)**, permitindo ser instalado no celular e utilizado de forma rápida, simples e offline-ready.

---

## 🚀 Objetivo do Sistema

Gerenciar e cobrir despesas fixas a partir de uma renda que entra de forma fragmentada e variável ao longo do mês. O sistema opera com três pilares fundamentais:

1. **Metas de Despesas Fixas:** O usuário define suas contas fixas do mês (ex: Aluguel: R$ 1.200, Alimentação: R$ 800, Energia: R$ 1.000).
2. **Registro de Ganhos Rápidos:** O usuário registra entradas diárias ou esporádicas de faturamento com 1 ou 2 cliques no celular.
3. **Rateio Proporcional Automático:** A cada ganho registrado, o motor de cálculo distribui o valor de forma proporcional entre todas as despesas ativas.

---

## 🧮 A Lógica do Rateio Proporcional

Diferente de um controle padrão, o NightLedger sabe exatamente qual a fatia percentual que cada despesa representa no seu orçamento geral e divide cada centavo ganho nessa mesma proporção.

### Exemplo Prático:
Se o seu orçamento de despesas fixas do mês totaliza **R$ 3.000,00**:
* **Aluguel (Meta: R$ 1.200,00)** $\rightarrow$ Representa **40%** do orçamento.
* **Alimentação (Meta: R$ 800,00)** $\rightarrow$ Representa **26,67%** do orçamento.
* **Energia (Meta: R$ 1.000,00)** $\rightarrow$ Representa **33,33%** do orçamento.

Ao lançar um ganho diário de **R$ 300,00**, o algoritmo realiza o rateio atômico instantâneo e aloca:
* 💵 **R$ 120,00** para o *Aluguel*.
* 💵 **R$ 80,00** para a *Alimentação*.
* 💵 **R$ 100,00** para a *Energia*.

> [!TIP]
> **Resiliência do Histórico:** Os valores distribuídos são consolidados em uma tabela física de **Allocations**. Isso garante que, caso você altere o valor ou exclua uma despesa no futuro, os lançamentos de ganhos passados não sofram distorções históricas.

---

## 🛠️ Stack Tecnológica

### Backend (API Modular)
* **Runtime:** Node.js
* **Framework:** Express.js (com roteamento modular e middleware global de exceções)
* **ORM:** Prisma ORM
* **Banco de Dados:** PostgreSQL

### Frontend (PWA Mobile-First)
* **Biblioteca:** React (Vite)
* **Estilização:** TailwindCSS (tema dark premium, componentes glassmorfistas e micro-animações)
* **Ícones:** Lucide React (ícones vetoriais modernos)
* **PWA:** Service Workers para caching de assets estáticos + Web App Manifest para instalação no celular.

---

## 📂 Estrutura de Pastas do Projeto

O repositório está estruturado no formato de subpastas dedicadas, mantendo a separação clara de responsabilidades:

```text
NightLedger/
├── backend/                  # API Express.js
│   ├── prisma/               # Configuração e migrações do banco
│   │   └── schema.prisma     # Modelagem de tabelas do Prisma ORM
│   ├── src/
│   │   ├── controllers/      # Handlers de controle de entrada/saída HTTP
│   │   ├── middlewares/      # Validadores de entrada e Handler de erros globais
│   │   ├── prisma/           # Instância única (Singleton) do Prisma Client
│   │   ├── routes/           # Rotas da API (/expenses, /incomes, /dashboard)
│   │   ├── services/         # Regras de negócio e transações de rateio
│   │   ├── utils/            # Custom AppErrors e formatadores de resposta
│   │   ├── app.js            # Inicialização de middlewares e rotas Express
│   │   └── server.js         # Inicialização do servidor na porta 3001
│   ├── package.json
│   └── .env                  # Variáveis de ambiente da API (DATABASE_URL, PORT)
│
├── frontend/                 # PWA React com Vite & Tailwind
│   ├── public/               # Service Worker (sw.js), Manifest PWA e ícones
│   ├── src/
│   │   ├── components/       # Header dinâmico, BottomNav, StatCards e progressos
│   │   ├── pages/            # Telas (Painel, Ganhos, Despesas e Resumo Mensal)
│   │   ├── services/         # Cliente HTTP Fetch de comunicação com a API
│   │   ├── App.jsx           # Coordenador de navegação e busca de dados
│   │   ├── index.css         # Reset CSS, estilos glassmorfistas e prevenção de bounce no iOS
│   │   └── main.jsx          # Bootstrap e registro do Service Worker
│   ├── package.json
│   ├── tailwind.config.js    # Definição da paleta de cores dark mode premium
│   └── vite.config.js        # Configuração do servidor Vite com host de rede exposto
│
├── docker-compose.yml        # Configuração para subir o PostgreSQL localmente
└── README.md                 # Este guia completo do projeto
```

---

## 🗄️ Modelagem do Banco de Dados (Prisma Schema)

O banco de dados PostgreSQL é gerenciado pelo Prisma ORM com a seguinte estrutura de tabelas:

```prisma
model Expense {
  id        String   @id @default(uuid())
  name      String
  amount    Float
  category  String
  createdAt DateTime @default(now()) @map("created_at")
  allocations Allocation[]

  @@map("expenses")
}

model Income {
  id        String   @id @default(uuid())
  amount    Float
  date      DateTime @default(now())
  notes     String?
  createdAt DateTime @default(now()) @map("created_at")
  allocations Allocation[]

  @@map("incomes")
}

model Allocation {
  id              String   @id @default(uuid())
  incomeId        String   @map("income_id")
  expenseId       String   @map("expense_id")
  amountAllocated Float    @map("amount_allocated")
  percentage      Float
  createdAt       DateTime @default(now()) @map("created_at")

  income  Income  @relation(fields: [incomeId], references: [id], onDelete: Cascade)
  expense Expense @relation(fields: [expenseId], references: [id], onDelete: Cascade)

  @@map("allocations")
}
```

---

## 📲 Otimizações Específicas para Mobile (PWA)

O NightLedger foi planejado para ter a **sensação de aplicativo nativo** quando instalado:
* **Prevenção de Bounce (iOS):** Adicionada trava de scroll fixo (`position: fixed` no corpo do documento) no arquivo [index.css](frontend/src/index.css) para remover o efeito elástico indesejado do Safari mobile.
* **Layout Standalone:** Configuração no [manifest.json](frontend/public/manifest.json) para esconder a barra de navegação superior e inferior do Chrome/Safari, preenchendo 100% da tela do aparelho.
* **Suporte a Notch Displays:** Aplicação do parâmetro `viewport-fit=cover` no [index.html](frontend/index.html) permitindo que o degradê e as cores de fundo cubram perfeitamente as áreas de câmera/notch dos celulares modernos.
* **Ação Instantânea:** Formulário de entrada rápida posicionado estrategicamente no topo do Painel, permitindo lançamentos ágeis no dia a dia.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** (v18 ou superior)
* **Docker** e **Docker Compose** (opcional, para subir o PostgreSQL localmente com facilidade)

### Passo 1: Subir o Banco de Dados (PostgreSQL)
Na raiz do projeto (onde está o arquivo `docker-compose.yml`), execute o comando para iniciar o banco em background:
```bash
docker compose up -d
```

### Passo 2: Configurar e Rodar o Backend
1. Navegue até a pasta `backend`:
   ```bash
   cd backend
   ```
2. Crie ou verifique o arquivo `.env` (já criado automaticamente):
   ```env
   PORT=3001
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/nightledger?schema=public"
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Execute as migrações do Prisma para criar as tabelas no PostgreSQL:
   ```bash
   $env:NODE_OPTIONS="--dns-result-order=ipv4first"
   npx prisma migrate dev --name init
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   $env:NODE_OPTIONS="--dns-result-order=ipv4first"
   npm run dev
   ```
*(O backend iniciará ouvindo na porta **http://localhost:3001**)*

### Passo 3: Configurar e Rodar o Frontend (PWA)
1. Abra uma nova aba de terminal e navegue até a pasta `frontend`:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor Vite:
   ```bash
   $env:NODE_OPTIONS="--dns-result-order=ipv4first"
   npm run dev
   ```
*(O frontend será servido em **http://localhost:5173**)*

---

## 📱 Testando Diretamente no Celular

Como o servidor do Vite foi configurado com a flag `host: true`, você pode acessar e instalar o aplicativo diretamente no seu celular real conectado à **mesma rede Wi-Fi** do seu computador:

1. Identifique o IP de rede local exibido no terminal ao iniciar o frontend (exemplo: `http://192.168.1.164:5173`).
2. Abra o navegador do seu celular (Chrome no Android ou Safari no iOS) e acesse esse endereço IP.
3. **Como Instalar:**
   * **Android (Chrome):** Toque nos três pontinhos no canto superior direito e selecione **"Adicionar à tela de início"** ou **"Instalar aplicativo"**.
   * **iOS (Safari):** Toque no botão de **"Compartilhar"** (ícone de quadrado com seta para cima) e selecione **"Adicionar à Tela de Início"**.

Agora você tem o **NightLedger** instalado na sua gaveta de aplicativos do celular, pronto para uso rápido no dia a dia! 🌌📈

---

## 👥 Autor

* **Lukk Valadão** - *Idealizador e Desenvolvedor principal* - [@lukk-valadao](https://github.com/lukk-valadao)

---

## 📄 Licença

Este projeto está sob a licença MIT - consulte o arquivo [LICENSE](file:///c:/Projetos/NightLedger/LICENSE) para obter mais detalhes.

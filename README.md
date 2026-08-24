# Viggo - Módulo de Prospecção de Leads & Mini-CRM

Módulo corporativo completo para prospecção automatizada de estabelecimentos comerciais no **Google Maps (Apify)**, enriquecimento cadastral e societário via **BrasilAPI (QSA/CNPJ)**, armazenamento em nuvem com **Neon PostgreSQL (Prisma ORM)** e painel administrativo com ação rápida de **1-Click WhatsApp**.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com **TypeScript** e **Express**
- **Prisma ORM** com suporte nativo a **PostgreSQL (Neon)**
- **Apify Client (`compass/crawler-google-places`)** com sanitização para o formato E.164 (`+55...`) e deduplicação
- **BrasilAPI** para consulta em tempo real de QSA (Quadro de Sócios e Administradores) e Razão Social
- **Zod** para validação de contratos e esquemas da API

### Frontend
- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS** com tema escuro moderno e responsivo
- **Lucide Icons**
- Visualização em **Tabela Analítica** e **Kanban / Pipeline Funnel**
- Gerador inteligente de mensagens para **WhatsApp 1-Click**

---

## 🚀 Como Executar o Projeto

### 1. Configurar Variáveis de Ambiente
Crie ou edite o arquivo `server/.env`:
```env
# URL de conexão do Neon PostgreSQL
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.neon.tech/neondb?sslmode=require"

# Porta do Servidor Express
PORT=3001

# Token do Apify (opcional: se não fornecido, o sistema usa simulação realista de dados)
APIFY_TOKEN="seu_token_do_apify"
```

### 2. Sincronizar o Banco de Dados com o Prisma
No diretório `server/`:
```bash
# Gerar os tipos do cliente Prisma
npm run prisma:generate

# Criar as tabelas no seu banco Neon PostgreSQL
npm run prisma:push

# (Opcional) Popular o banco com leads de teste
npm run prisma:seed
```

### 3. Rodar Backend e Frontend

**Executar Backend (Express):**
```bash
cd server
npm run dev
```
O backend rodará em `http://localhost:3001`.

**Executar Frontend (Vite):**
```bash
cd client
npm run dev
```
O frontend rodará em `http://localhost:5173`.

---

## 📋 Funcionalidades Implementadas

1. **Modelagem Prisma ORM (`prisma/schema.prisma`):**
   - Entidade `Lead` com campos completos (`name`, `companyName`, `cnpj`, `phone`, `category`, `decisionMaker`, `source`, `status`, `notes`, `rating`, `reviewsCount`, `address`, `city`).
   - Índices otimizados para busca rápida por status, categoria e telefone único.

2. **Extração com Apify (`services/apify-scraper.ts`):**
   - Actor `compass/crawler-google-places` com busca em português (`"${niche} em ${city}"`).
   - Higienização e sanitização automática de telefones para o padrão internacional E.164 (`+55...`).
   - Rejeição de registros sem telefone e deduplicação atômica no banco de dados.

3. **Enriquecimento Societário via BrasilAPI (`services/cnpj-enrichment.ts`):**
   - Consulta direta ao endpoint `https://brasilapi.com.br/api/cnpj/v1/{cnpj}`.
   - Extração do sócio administrador prioritário (`decisionMaker`) no QSA e atualização no lead.

4. **Painel Mini-CRM:**
   - **Barra de Ação Rápida:** Prospecção por nicho e cidade com limite customizável.
   - **Métricas:** 6 KPIs (Total, Novos, Contatados, Em Negociação, Convertidos, Taxa de Conversão).
   - **Tabela & Kanban:** Alternância entre tabela detalhada e funil de vendas.
   - **1-Click WhatsApp:** Templates personalizados conforme a presença ou ausência de sócio (`decisionMaker`).
   - **Drawer de Detalhes:** Histórico, notas com auto-save e enriquecimento instantâneo.
   - **Exportação CSV:** Exportação com 1 clique da lista de leads.

# VaiTerPlay — Documentação do Frontend para o Backend

> Documento de referência para a equipe de backend. Descreve todas as rotas, endpoints consumidos, dados mockados, estrutura de autenticação e contratos esperados pelo frontend.

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Configuração do Cliente HTTP](#2-configuração-do-cliente-http)
3. [Autenticação (AuthContext)](#3-autenticação-authcontext)
4. [Rotas da Aplicação](#4-rotas-da-aplicação)
5. [Endpoints Consumidos — Autenticação](#5-endpoints-consumidos--autenticação)
6. [Endpoints Consumidos — Admin](#6-endpoints-consumidos--admin)
7. [Endpoints Consumidos — Gestor](#7-endpoints-consumidos--gestor)
8. [Dados Mockados (substituir por APIs reais)](#8-dados-mockados-substituir-por-apis-reais)
9. [Funções Utilitárias (formatters)](#9-funções-utilitárias-formatters)
10. [Layouts e Responsividade](#10-layouts-e-responsividade)
11. [Observações e Pendências](#11-observações-e-pendências)

---

## 1. Visão Geral da Arquitetura

```
src/
├── api/                    # Cliente HTTP (Axios) e endpoints organizados por domínio
│   ├── client.js           # Instância Axios configurada
│   ├── interceptors.js     # Interceptors (token Bearer, tratamento 401)
│   ├── agendaApi.js        # Endpoint compartilhado de agenda (slots)
│   └── endpoints/          # Um arquivo por domínio (authApi, gestorReservasApi, etc.)
├── assets/                 # Imagens estáticas (logo, etc.)
├── components/             # Componentes reutilizáveis (UI, agenda, roteamento)
├── context/
│   └── AuthContext.jsx     # Contexto de autenticação global
├── data/
│   └── mockContatos.js     # Dados mock centralizados de contatos
├── hooks/
│   ├── useDevice.js        # Detecção de dispositivo (mobile/tablet/desktop)
│   ├── useApiRequest.js    # Hook genérico para chamadas API (loading/error)
│   └── api/                # Hooks customizados por domínio (useGestorReservas, etc.)
├── layouts/                # Layouts (Admin, Gestor Desktop, Mobile)
├── pages/                  # Páginas organizadas por role e dispositivo
│   ├── admin/              # Páginas do painel Admin
│   └── gestor/             # Páginas do painel Gestor
│       └── mobile/         # Versões mobile das páginas do Gestor
├── services/
│   └── api.js              # Re-export do apiClient (compatibilidade)
└── utils/
    └── formatters.js       # Funções de formatação (moeda, data, hora, status)
```

O frontend é construído com **React + Vite**, usa **React Router v6** para rotas e **Axios** para comunicação com o backend. A responsividade é feita com o hook `useDevice` (breakpoints: 768px mobile, 1024px tablet) e o componente `DeviceRouter` que escolhe o layout adequado.

---

## 2. Configuração do Cliente HTTP

**Arquivo:** `api/client.js`

| Configuração    | Valor                                                |
|-----------------|------------------------------------------------------|
| Base URL        | `import.meta.env.VITE_API_URL` ou `https://api.vaiterplay.com.br` |
| Timeout         | 30 segundos                                          |
| Content-Type    | `application/json`                                   |

**Arquivo:** `api/interceptors.js`

- **Request interceptor:** Adiciona `Authorization: Bearer <token>` em todas as requisições, **exceto** `/auth/login`.
- **Response interceptor:** Em caso de erro **401** (exceto na rota de login), executa `logout()` e redireciona para `/login`.
- **Token:** Lido do `localStorage` com a chave `vaiterplay_token`.

---

## 3. Autenticação (AuthContext)

**Arquivo:** `context/AuthContext.jsx`

### Dados armazenados

| Local          | Chave                  | Conteúdo                                   |
|----------------|------------------------|---------------------------------------------|
| `localStorage` | `vaiterplay_token`     | Token JWT retornado pelo login              |
| `localStorage` | `vaiterplay_usuario`   | JSON do usuário (campo `tipo` em minúsculas) |
| React state    | `usuario`              | Objeto do usuário normalizado               |
| React state    | `carregando`           | Boolean de carregamento inicial             |

### Fluxo de Login

1. Frontend chama `POST /auth/login` com `{ email, senha }`.
2. **Resposta esperada do backend:** `{ token: "jwt_token", usuario: { id, nome, email, tipo, ... } }`.
3. O campo `tipo` é normalizado para minúsculas (`"admin"` ou `"gestor"`).
4. Token e usuário são salvos no `localStorage`.
5. Estado React é atualizado.
6. Retorna o objeto do usuário.

### Fluxo de Logout

1. Remove `vaiterplay_token` e `vaiterplay_usuario` do `localStorage`.
2. Define `usuario` como `null` no state.
3. Interceptor redireciona para `/login`.

### Validação na Inicialização

- Se existir token no `localStorage`, faz `GET /auth/validar-token`.
- Se válido, mantém sessão. Se inválido (401), o interceptor executa logout automaticamente.

### Sincronização entre abas

- Escuta o evento `storage` do browser para sincronizar estado quando outra aba faz login/logout.

### Proteção de rotas

O componente `RotaPrivada` verifica:
- Se o usuário está autenticado.
- Se o `tipo` do usuário corresponde à role esperada (`"admin"` ou `"gestor"`).
- Se não atende, redireciona para `/login`.

---

## 4. Rotas da Aplicação

### Rotas Públicas

| Rota               | Página              | Descrição                                   |
|--------------------|---------------------|---------------------------------------------|
| `/`                | LandingPage         | Tela inicial com botão para entrar          |
| `/login`           | LoginPage           | Formulário de login (email + senha)         |
| `/esqueci-senha`   | EsqueciSenhaPage    | Solicitar recuperação de senha por email    |
| `/resetar-senha`   | ResetarSenhaPage    | Definir nova senha (com token da URL)       |
| `/nova-senha`      | ResetarSenhaPage    | Alias para resetar-senha                    |
| `/trocar-senha`    | TrocarSenhaPage     | Trocar senha estando logado                 |

### Rotas Admin (protegidas, role: `admin`)

| Rota                   | Página                | Descrição                              |
|------------------------|-----------------------|----------------------------------------|
| `/admin`               | AdminDashboardPage    | Dashboard com KPIs e visão geral       |
| `/admin/gestores`      | AdminGestoresPage     | CRUD de gestores                       |
| `/admin/empresas`      | AdminEmpresasPage     | CRUD de empresas, consulta, audit log  |
| `/admin/quadras`       | AdminQuadrasPage      | CRUD de quadras                        |
| `/admin/agenda`        | AdminAgendaPage       | Gestão de regras e slots da agenda     |
| `/admin/reservas`      | AdminReservasPage     | Visualização e gestão de reservas      |
| `/admin/financeiro`    | AdminFinanceiroPage   | Visão financeira geral                 |
| `/admin/repasses`      | AdminRepassesPage     | Gestão de repasses para gestores       |

### Rotas Gestor (protegidas, role: `gestor`)

O `DeviceRouter` detecta se o dispositivo é mobile ou desktop e renderiza o layout apropriado (`GestorLayout` ou `MobileLayout`). O `ResponsivePage` escolhe a versão da página adequada.

| Rota                                  | Desktop                          | Mobile                             | Descrição                           |
|---------------------------------------|----------------------------------|------------------------------------|-------------------------------------|
| `/gestor`                             | GestorDashboardPage              | (via DeviceRouter)                 | Dashboard do gestor                 |
| `/gestor/mensagens`                   | —                                | GestorMobileMensagensPage          | Lista de conversas                  |
| `/gestor/mensagens/chat/:chatId`      | —                                | GestorMobileChatPage               | Chat individual com cliente         |
| `/gestor/empresas`                    | GestorEmpresasPage               | —                                  | Lista de empresas/complexos         |
| `/gestor/empresas/editar/:empresaId`  | GestorEmpresaEditarPage          | —                                  | Edição de empresa                   |
| `/gestor/quadras`                     | GestorQuadrasListPage            | —                                  | Lista de quadras                    |
| `/gestor/quadras/nova`                | GestorQuadrasPage                | —                                  | Cadastro de nova quadra             |
| `/gestor/quadras/editar/:quadraId`    | GestorQuadraEditarPage           | —                                  | Edição de quadra                    |
| `/gestor/regras-de-horarios`          | GestorRegrasSelecaoPage          | GestorMobileRegrasSelecaoPage      | Seleção entre regras e bloqueios    |
| `/gestor/regras-de-horarios/regras`   | GestorAgendaPage                 | GestorMobileAgendaPage             | Regras de horários                  |
| `/gestor/regras-de-horarios/bloqueios`| GestorBloqueiosPage              | GestorMobileBloqueiosPage          | Bloqueios de horários               |
| `/gestor/reservas`                    | GestorReservasPage               | GestorMobileReservasPage           | Gestão de reservas                  |
| `/gestor/clientes`                    | GestorClientesPage               | GestorMobileClientesPage           | Lista de clientes e histórico       |
| `/gestor/relatorios`                  | GestorRelatoriosPage             | GestorMobileRelatoriosPage         | Relatórios (reservas + faturamento) |
| `/gestor/financeiro`                  | GestorFinanceiroPage             | —                                  | Painel financeiro                   |
| `/gestor/configuracoes`               | GestorConfiguracoesSelecaoPage   | —                                  | Menu de configurações               |
| `/gestor/configuracoes/complexo`      | GestorConfiguracoesPage          | —                                  | Configurações do complexo           |
| `/gestor/configuracoes/quadras`       | GestorConfiguracoesQuadrasPage   | —                                  | Configurações das quadras           |
| `/gestor/ajuda`                       | GestorAjudaPage                  | —                                  | Central de ajuda (FAQ)              |

> Qualquer rota não mapeada (`*`) redireciona para `/login`.

---

## 5. Endpoints Consumidos — Autenticação

**Arquivo:** `api/endpoints/authApi.js`

| Função          | Método | Rota                   | Body / Params                             | Resposta Esperada                            |
|-----------------|--------|------------------------|-------------------------------------------|----------------------------------------------|
| `login`         | POST   | `/auth/login`          | `{ email, senha }`                        | `{ token, usuario: { id, nome, email, tipo } }` |
| `esqueciSenha`  | POST   | `/auth/esqueci-senha`  | `{ email }`                               | `{ message }` ou similar                     |
| `resetarSenha`  | POST   | `/auth/resetar-senha`  | `{ token, novaSenha }` (a confirmar)      | `{ message }` ou similar                     |
| `trocarSenha`   | PUT    | `/auth/trocar-senha`   | `{ senhaAtual, novaSenha }` (a confirmar) | `{ message }` ou similar                     |
| `validarToken`  | GET    | `/auth/validar-token`  | —                                         | 200 OK se válido, 401 se expirado           |
| `refresh`       | POST   | `/auth/refresh`        | —                                         | `{ token }` (novo token)                     |

---

## 6. Endpoints Consumidos — Admin

### 6.1 Dashboard (`adminDashboardApi.js`)

| Função                  | Método | Rota                        | Params           |
|-------------------------|--------|-----------------------------|------------------|
| `obterOverview`         | GET    | `/admin/dashboard-overview`  | `params` (filtros) |
| `obterFinanceiroOverview` | GET  | `/admin/financeiro-overview` | `params` (filtros) |

### 6.2 Gestores (`adminGestoresApi.js`)

| Função              | Método | Rota                                  | Body / Params     |
|---------------------|--------|---------------------------------------|-------------------|
| `listar`            | GET    | `/admin/gestores-resumo`              | —                 |
| `criar`             | POST   | `/admin/usuarios`                     | `dados` (objeto)  |
| `editar`            | PUT    | `/admin/gestores/{id}`                | `dados` (objeto)  |
| `promover`          | PUT    | `/admin/usuarios/{id}/promover`       | —                 |
| `reenviarAtivacao`  | POST   | `/admin/gestores/{id}/reenviar-ativacao` | —              |

### 6.3 Empresas (`adminEmpresasApi.js`)

| Função                | Método | Rota                              | Body / Params                 |
|-----------------------|--------|-----------------------------------|-------------------------------|
| `listar`              | GET    | `/admin/empresas`                 | —                             |
| `criar`               | POST   | `/admin/empresas`                 | `dados` (objeto)              |
| `editar`              | PUT    | `/admin/empresas/{id}`            | `dados` (objeto)              |
| `excluir`             | DELETE | `/admin/empresas/{id}`            | `params: { confirm: "DELETE" }` |
| `consultar`           | GET    | `/admin/consulta`                 | `params: { q: "termo" }`     |
| `obterDetalheGestor`  | GET    | `/admin/gestores/{id}/detalhe`    | —                             |
| `obterDetalheEmpresa` | GET    | `/admin/empresas/{id}/detalhe`    | —                             |
| `obterAuditLog`       | GET    | `/admin/audit-log`                | `params` (filtros)            |

### 6.4 Quadras (`adminQuadrasApi.js`)

| Função            | Método | Rota                              | Body / Params               |
|-------------------|--------|-----------------------------------|-----------------------------|
| `listar`          | GET    | `/admin/quadras`                  | `params` (filtros)          |
| `criar`           | POST   | `/admin/quadras`                  | `dados` (objeto)            |
| `editar`          | PUT    | `/admin/quadras/{id}`             | `dados` (objeto)            |
| `atualizarFotos`  | PUT    | `/admin/quadras/{id}/fotos`       | `FormData` (multipart)      |
| `desativar`       | PATCH  | `/admin/quadras/{id}/desativar`   | `dados` (objeto)            |
| `reativar`        | PATCH  | `/admin/quadras/{id}/reativar`    | —                           |
| `excluir`         | DELETE | `/admin/quadras/{id}`             | —                           |

### 6.5 Agenda (`adminAgendaApi.js`)

| Função              | Método | Rota                              | Body / Params     |
|---------------------|--------|-----------------------------------|-------------------|
| `listarRegras`      | GET    | `/admin/agenda/regras`            | `params` (filtros) |
| `listarBloqueios`   | GET    | `/admin/agenda/bloqueios`         | `params` (filtros) |
| `criarRegrasLote`   | POST   | `/admin/agenda/regras/lote`       | `dados` (array)   |
| `editarRegra`       | PUT    | `/admin/agenda/regras/{id}`       | `dados` (objeto)  |
| `excluirRegra`      | DELETE | `/admin/agenda/regras/{id}`       | —                 |
| `criarBloqueiosLote`| POST   | `/admin/agenda/bloqueios/lote`    | `dados` (array)   |
| `excluirBloqueio`   | DELETE | `/admin/agenda/bloqueios/{id}`    | —                 |
| `obterSlots`        | GET    | `/admin/agenda/slots`             | `params` (filtros) |

### 6.6 Reservas (`adminReservasApi.js`)

| Função      | Método | Rota                        | Body / Params     |
|-------------|--------|-----------------------------|-------------------|
| `listar`    | GET    | `/admin/reservas`           | `params` (filtros) |
| `obterGrade`| GET    | `/admin/reservas/grade`     | `params` (filtros) |
| `criar`     | POST   | `/admin/reservas`           | `dados` (objeto)  |
| `editar`    | PUT    | `/admin/reservas/{id}`      | `dados` (objeto)  |
| `cancelar`  | DELETE | `/admin/reservas/{id}`      | —                 |

### 6.7 Financeiro (`adminFinanceiroApi.js`)

| Função           | Método | Rota                         | Params           |
|------------------|--------|------------------------------|------------------|
| `obterOverview`  | GET    | `/admin/financeiro-overview`  | `params` (filtros) |
| `obterResumo`    | GET    | `/admin/financeiro/resumo`   | `params` (filtros) |

### 6.8 Repasses (`adminRepassesApi.js`)

| Função          | Método | Rota                                  | Body / Params     |
|-----------------|--------|---------------------------------------|-------------------|
| `listar`        | GET    | `/admin/repasses`                     | `params` (filtros) |
| `gerar`         | POST   | `/admin/repasses/gerar`               | `dados` (objeto)  |
| `obterDetalhe`  | GET    | `/admin/repasses/{id}`                | —                 |
| `marcarPago`    | PUT    | `/admin/repasses/{id}/marcar-pago`    | —                 |

---

## 7. Endpoints Consumidos — Gestor

### 7.1 Dashboard (`gestorDashboardApi.js`)

| Função                    | Método | Rota                      | Params           |
|---------------------------|--------|---------------------------|------------------|
| `obterKpis`               | GET    | `/gestor/dashboard/kpis`  | —                |
| `obterContatos`           | GET    | `/gestor/contatos`        | —                |
| `obterMensagensPorContato`| GET    | `/gestor/mensagens`       | `params` (filtros) |

### 7.2 Empresas (`gestorEmpresasApi.js`)

| Função      | Método | Rota                               | Body / Params    |
|-------------|--------|-------------------------------------|------------------|
| `listar`    | GET    | `/gestor/empresas`                 | —                |
| `obter`     | GET    | `/gestor/empresas/{id}`            | —                |
| `criar`     | POST   | `/gestor/empresas`                 | `dados` (objeto) |
| `editar`    | PUT    | `/gestor/empresas/{id}`            | `dados` (objeto) |
| `desativar` | PATCH  | `/gestor/empresas/{id}/desativar`  | —                |
| `reativar`  | PATCH  | `/gestor/empresas/{id}/reativar`   | —                |

### 7.3 Quadras (`gestorQuadrasApi.js`)

| Função            | Método | Rota                                     | Body / Params          |
|-------------------|--------|------------------------------------------|------------------------|
| `listar`          | GET    | `/gestor/quadras`                        | `params` (filtros)     |
| `criar`           | POST   | `/gestor/quadras`                        | `dados` (objeto)       |
| `editar`          | PUT    | `/gestor/quadras/{id}`                   | `dados` (objeto)       |
| `atualizarFotos`  | PUT    | `/gestor/quadras/{id}/fotos`             | `FormData` (multipart) |
| `removerFoto`     | DELETE | `/gestor/quadras/{id}/foto/{slot}`       | —                      |
| `desativar`       | PATCH  | `/gestor/quadras/{id}/desativar`         | —                      |
| `reativar`        | PATCH  | `/gestor/quadras/{id}/reativar`          | —                      |

### 7.4 Agenda (`gestorAgendaApi.js`)

| Função              | Método | Rota                                | Body / Params     |
|---------------------|--------|-------------------------------------|-------------------|
| `listarRegras`      | GET    | `/gestor/agenda/regras`             | `params` (filtros) |
| `criarRegra`        | POST   | `/gestor/agenda/regras`             | `dados` (objeto)  |
| `editarRegra`       | PUT    | `/gestor/agenda/regras/{id}`        | `dados` (objeto)  |
| `excluirRegra`      | DELETE | `/gestor/agenda/regras/{id}`        | —                 |
| `listarBloqueios`   | GET    | `/gestor/agenda/bloqueios`          | `params` (filtros) |
| `criarBloqueiosLote`| POST   | `/gestor/agenda/bloqueios/lote`     | `dados` (array)   |
| `editarBloqueio`    | PUT    | `/gestor/agenda/bloqueios/{id}`     | `dados` (objeto)  |
| `excluirBloqueio`   | DELETE | `/gestor/agenda/bloqueios/{id}`     | —                 |
| `obterSlots`        | GET    | `/gestor/agenda/slots`              | `params` (filtros) |

**Endpoint compartilhado** (`agendaApi.js`):

| Função             | Método | Rota                                       | Params                                              |
|--------------------|--------|--------------------------------------------|------------------------------------------------------|
| `fetchAgendaSlots` | GET    | `/gestor/agenda/slots` ou `/admin/agenda/slots` | `quadraId`, `periodo`, `dataInicio`, `dataFim`, `filtro` |

### 7.5 Reservas (`gestorReservasApi.js`)

| Função       | Método | Rota                        | Body / Params     |
|--------------|--------|-----------------------------|-------------------|
| `listar`     | GET    | `/gestor/reservas`          | `params` (filtros) |
| `obterGrade` | GET    | `/gestor/reservas/grade`    | `params` (filtros) |
| `criar`      | POST   | `/gestor/reservas`          | `dados` (objeto)  |
| `cancelar`   | DELETE | `/gestor/reservas/{id}`     | —                 |

### 7.6 Financeiro (`gestorFinanceiroApi.js`)

| Função                | Método | Rota                                    | Body / Params     |
|-----------------------|--------|-----------------------------------------|-------------------|
| `obterOverview`       | GET    | `/gestor/financeiro/overview`           | `params` (filtros) |
| `listarPagamentos`    | GET    | `/gestor/financeiro/pagamentos`         | `params` (filtros) |
| `obterReservasPorDia` | GET    | `/gestor/financeiro/reservas-por-dia`   | `params` (filtros) |
| `listarTransacoes`    | GET    | `/gestor/financeiro/transacoes`         | `params` (filtros) |
| `listarRepasses`      | GET    | `/gestor/repasses`                      | `params` (filtros) |
| `obterDetalheRepasse` | GET    | `/gestor/repasses/{id}`                 | —                 |
| `solicitarRepasse`    | POST   | `/gestor/repasses/solicitar`            | `dados` (objeto)  |
| `obterDadosBancarios` | GET    | `/gestor/dados-bancarios`               | —                 |

### 7.7 Clientes (`gestorClientesApi.js`)

| Função           | Método | Rota                                      | Params           |
|------------------|--------|-------------------------------------------|------------------|
| `listar`         | GET    | `/gestor/clientes`                        | `params` (filtros) |
| `obterHistorico` | GET    | `/gestor/clientes/{clienteId}/historico`  | —                |

### 7.8 Mensagens (`gestorMensagensApi.js`)

| Função                   | Método | Rota                                            | Body / Params    |
|--------------------------|--------|--------------------------------------------------|------------------|
| `listarConversas`        | GET    | `/gestor/conversas`                              | `params` (filtros) |
| `obterMensagens`         | GET    | `/gestor/conversas/{conversaId}/mensagens`       | —                |
| `enviarMensagem`         | POST   | `/gestor/conversas/{conversaId}/mensagens`       | `dados` (objeto) |
| `obterHistoricoReservas` | GET    | `/gestor/clientes/{clienteId}/historico-reservas` | —               |

### 7.9 Relatórios (`gestorRelatoriosApi.js`)

| Função            | Método | Rota                               | Params                      |
|-------------------|--------|-------------------------------------|-----------------------------|
| `obterReservas`   | GET    | `/gestor/relatorios/reservas`      | `params` (filtros de data)  |
| `obterFaturamento`| GET    | `/gestor/relatorios/faturamento`   | `params` (filtros de data)  |
| `exportar`        | GET    | `/gestor/relatorios/exportar`      | `params` (retorna **blob**) |

### 7.10 Configurações (`gestorConfiguracoesApi.js`)

| Função            | Método | Rota                                  | Body / Params          |
|-------------------|--------|---------------------------------------|------------------------|
| `obterComplexo`   | GET    | `/gestor/configuracoes/complexo`      | —                      |
| `salvarComplexo`  | PUT    | `/gestor/configuracoes/complexo`      | `dados` (objeto)       |
| `salvarEndereco`  | PUT    | `/gestor/configuracoes/endereco`      | `dados` (objeto)       |
| `salvarFinanceiro`| PUT    | `/gestor/configuracoes/financeiro`    | `dados` (objeto)       |
| `uploadLogo`      | POST   | `/gestor/configuracoes/logo`          | `FormData` (multipart) |

---

## 8. Dados Mockados (substituir por APIs reais)

Estes são dados fictícios usados no frontend enquanto os endpoints reais não estão implementados. Cada item indica o arquivo onde está definido, a estrutura dos dados e qual endpoint deve substituí-lo.

### 8.1 Mock centralizado: `data/mockContatos.js`

Usado por: `GestorDashboardPage`, `GestorMobileChatPage`, `MobileLayout`, `GestorLayout`

```
mockContatos = [
  {
    id: number,
    nome: string,
    telefone: string,           // ex: "(11) 98765-4321"
    ultimaMensagem: string,
    hora: string,               // ex: "14:30"
    naoLidas: number,
    avatar: string,             // ex: "JS" (iniciais)
    fixo: boolean               // true = contato do suporte (não gera notificação)
  }
]
```

**Endpoint que substitui:** `GET /gestor/contatos`

```
mockNovaReserva = {
  id: number,
  mensagem: string,             // ex: "Nova reserva criada para hoje às 18h - Quadra 1"
  hora: string
}
```

**Endpoint que substitui:** Sistema de notificações real (WebSocket ou polling)

**Funções auxiliares:**
- `gerarNotificacoes(contatos, novaReserva)` — Gera array de notificações a partir de mensagens não lidas e novas reservas.
- `contarNotificacoesPendentes(contatos, novaReserva)` — Conta total de notificações pendentes.

---

### 8.2 Conversas — `GestorMobileMensagensPage.jsx`

```
MOCK_CONVERSAS = [
  {
    id: number,
    nome: string,
    telefone: string,
    ultimaMensagem: string,
    hora: string,
    naoLidas: number,
    avatar: string,             // iniciais
    tipo: string                // "suporte" | "cliente"
  }
]
```

**Endpoint que substitui:** `GET /gestor/conversas`

---

### 8.3 Chat — `GestorMobileChatPage.jsx`

```
MOCK_CONTATOS_MAP = {
  [id: number]: {
    nome: string,
    telefone: string,
    online: boolean
  }
}

MOCK_MENSAGENS = [
  {
    id: number,
    texto: string,
    enviada: boolean,           // true = mensagem do gestor, false = do cliente
    hora: string
  }
]

MOCK_HISTORICO = [
  {
    id: number,
    data: string,               // ex: "2025-06-15"
    hora: string,               // ex: "18:00"
    tipoQuadra: string,         // ex: "Beach Tennis"
    valor: number,
    status: string,             // "paid" | "pending" | "canceled"
    empresa: string,            // (opcional)
    created_at: string
  }
]
```

**Endpoints que substituem:**
- `MOCK_CONTATOS_MAP` → `GET /gestor/contatos`
- `MOCK_MENSAGENS` → `GET /gestor/conversas/{id}/mensagens`
- `MOCK_HISTORICO` → `GET /gestor/clientes/{id}/historico-reservas`

---

### 8.4 Dashboard do Gestor — `GestorDashboardPage.jsx`

```
MOCK_QUADRAS_CONFIG = [
  {
    id: number,
    nome: string,               // ex: "Quadra 1"
    estrutura: string,          // ex: "Coberta"
    material: string,           // ex: "Areia"
    modalidades: string[],      // ex: ["Beach Tennis", "Vôlei"]
    quantidade_quadras: number,
    status: string              // "ativa" | "inativa"
  }
]
```

**Endpoint que substitui:** `GET /gestor/quadras`

Também usa `mockContatos` e `mensagensPorContato` (mapa de mensagens por ID de contato) importados/definidos localmente.

**Endpoints que substituem:**
- `mockContatos` → `GET /gestor/contatos`
- `mensagensPorContato` → `GET /gestor/conversas/{id}/mensagens`

---

### 8.5 Clientes — `GestorClientesPage.jsx` e `GestorMobileClientesPage.jsx`

```
gerarMockClientes() retorna:
[
  {
    id: number,
    nome: string,
    cpf: string,
    telefone: string,
    email: string,
    totalReservas: number,
    totalGasto: number,
    ultimaReserva: string,      // data ISO
    dataCadastro: string        // data ISO
  }
]

gerarMockHistorico() retorna:
[
  {
    id: number,
    data: string,               // data ISO
    hora: string,               // ex: "18:00"
    tipoQuadra: string,
    valor: number,
    status: string,             // "paid" | "pending" | "canceled"
    empresa: string,            // (apenas na versão desktop)
    created_at: string
  }
]
```

**Endpoints que substituem:**
- `gerarMockClientes()` → `GET /gestor/clientes`
- `gerarMockHistorico()` → `GET /gestor/clientes/{clienteId}/historico`

---

### 8.6 Financeiro — `GestorFinanceiroPage.jsx`

```
gerarMockFinanceiro() retorna:
{
  ovTotal: {
    kpis: {
      valor_liquido: number,
      receita_bruta: number,
      taxa_plataforma: number,
      qtd_pagamentos: number
    }
  },
  ovPendente: { kpis: { ... } },
  ovCancelado: { kpis: { ... } },
  reservasPorDia: [
    { data: Date, valor: number }
  ],
  transacoesConcluidas: [
    { id: number, data: string, valor: number, descricao: string }
  ],
  repassesMock: [
    {
      id: number,
      valor_total_liquido: number,
      nome_titular: string,
      data_pagamento: string,
      status: string,
      created_at: string
    }
  ]
}
```

**Endpoints que substituem:**
- `ovTotal/ovPendente/ovCancelado` → `GET /gestor/financeiro/overview` (com parâmetros de filtro por status)
- `reservasPorDia` → `GET /gestor/financeiro/reservas-por-dia`
- `transacoesConcluidas` → `GET /gestor/financeiro/transacoes`
- `repassesMock` → `GET /gestor/repasses`

---

### 8.7 Financeiro Mobile — `GestorMobileFinanceiroPage.jsx`

```
MOCK_OVERVIEW = {
  kpis: {
    valor_liquido: number,
    receita_bruta: number,
    taxa_plataforma: number,
    qtd_pagamentos: number
  }
}

MOCK_OVERVIEW_TOTAL = { kpis: { ... } }    // mesmo formato

MOCK_REPASSES = [
  {
    id: number,
    valor_total_liquido: number,
    status: string,
    data_pagamento: string
  }
]
```

**Endpoints que substituem:**
- `MOCK_OVERVIEW` / `MOCK_OVERVIEW_TOTAL` → `GET /gestor/financeiro/overview`
- `MOCK_REPASSES` → `GET /gestor/repasses`

---

### 8.8 Relatórios — `GestorRelatoriosPage.jsx` e `GestorMobileRelatoriosPage.jsx`

```
dadosRelatorio = {
  totalReservas: number,
  totalReceita: number,
  reservasCanceladas: number,
  taxaOcupacao: number,         // percentual (ex: 72.5)
  reservasPorDia: [
    { dia: string, reservas: number }   // dia = "Seg", "Ter", etc.
  ],
  reservasPorHora: [
    { hora: string, reservas: number }  // hora = "06:00", "07:00", etc.
  ],
  topQuadras: [
    { nome: string, reservas: number, receita: number }
  ]
}

reservasPorDiaDoMes = {
  "2026-03-01": number,
  "2026-03-02": number,
  ...                           // pseudo-aleatório para o calendário
}
```

**Endpoints que substituem:**
- `dadosRelatorio` → `GET /gestor/relatorios/reservas` + `GET /gestor/relatorios/faturamento`
- `reservasPorDiaDoMes` → `GET /gestor/relatorios/reservas` (agrupado por dia)

---

### 8.9 Configurações do Complexo — `GestorConfiguracoesPage.jsx`

```
MOCK_DADOS_COMPLEXO = {
  nome: string,
  cnpj: string,
  cep: string,
  endereco: string,
  numero: string,
  complemento: string,
  bairro: string,
  cidade: string,
  estado: string,
  email: string,
  telefone: string,
  descricao: string,
  logo: null | string,          // URL da logo
  logoPreview: null | string
}

MOCK_DADOS_FINANCEIROS = {
  chavePix: string,
  nomeTitular: string
}
```

**Endpoint que substitui:** `GET /gestor/configuracoes/complexo`

---

### 8.10 Configurações de Quadras — `GestorConfiguracoesQuadrasPage.jsx`

```
MOCK_QUADRAS = [
  {
    id: number,
    nome: string,
    estrutura: string,
    material: string,
    modalidades: string[],
    quantidade_quadras: number,
    apelido: string,
    empresa_id: number,
    status: string,
    created_at: string
  }
]

MOCK_EMPRESAS = [
  {
    id: number,
    nome: string,
    endereco_resumo: string
  }
]
```

**Endpoints que substituem:**
- `MOCK_QUADRAS` → `GET /gestor/quadras`
- `MOCK_EMPRESAS` → `GET /gestor/empresas`

---

### 8.11 Ajuda — `GestorAjudaPage.jsx`

```
FAQ_DATA = [
  {
    category: string,           // ex: "Reservas"
    icon: string,               // nome do ícone
    items: [
      {
        pergunta: string,
        resposta: string
      }
    ]
  }
]

QUICK_LINKS = [
  {
    label: string,
    path: string,               // rota interna
    icon: string
  }
]
```

**Observação:** `FAQ_DATA` pode ser estático ou vir de um CMS/endpoint futuro. `QUICK_LINKS` é navegação estática interna.

---

## 9. Funções Utilitárias (formatters)

**Arquivo:** `utils/formatters.js`

Estas funções são usadas por todo o frontend para exibição de dados. O backend deve retornar dados nos formatos que essas funções esperam:

| Função             | Entrada                   | Saída               | Formato esperado do backend          |
|--------------------|---------------------------|----------------------|--------------------------------------|
| `formatarMoeda`    | `number` ou `string`      | `"R$ 1.234,56"`     | Valores numéricos (ex: `1234.56`)    |
| `formatarNumero`   | `number` ou `string`      | `"1.234"`            | Valores numéricos inteiros           |
| `formatarDataBR`   | `string` ISO              | `"25/03/2026"`       | Datas no formato `YYYY-MM-DD`        |
| `toISODate`        | `Date`                    | `"2026-03-25"`       | —                                    |
| `formatarHora`     | `number` (hora inteira)   | `"08:00"`            | Horas como inteiros (ex: `8`, `18`)  |
| `formatarHoraStr`  | `string` (`"18:00:00"`)   | `"18:00"`            | Horas no formato `HH:MM:SS`         |
| `arredondar2`      | `number`                  | `number` (2 casas)   | —                                    |
| `formatarStatus`   | `string`                  | Traduzido            | Status: `"paid"`, `"pending"`, `"canceled"` |

> **Importante para o backend:** Os status de reserva/pagamento devem ser retornados como `"paid"`, `"pending"` ou `"canceled"` (em inglês). O frontend faz a tradução para exibição.

---

## 10. Layouts e Responsividade

### DeviceRouter

Detecta o tipo de dispositivo usando o hook `useDevice`:
- **Mobile:** largura < 768px → renderiza `MobileLayout`
- **Tablet:** 768px–1024px → renderiza `MobileLayout`
- **Desktop:** > 1024px → renderiza `GestorLayout`

### ResponsivePage

Recebe duas props (`desktop` e `mobile`) e renderiza o componente adequado para o dispositivo detectado.

### AdminLayout

Sidebar fixa com navegação: Dashboard, Gestores, Empresas, Quadras, Agenda, Reservas, Financeiro, Repasses, Sair. Inclui `PainelHeader` com informações do usuário.

### GestorLayout (Desktop)

Sidebar fixa com navegação: Dashboard, Reservas, Clientes, Relatórios, Regras de Horários, Financeiro, Configurações, Ajuda. `PainelHeader` inclui badge de notificações usando `mockContatos`.

### MobileLayout (Mobile)

Header com logo e badge de notificações. Bottom navigation com: Mensagens, Reservas, Relatórios, Mais. O menu "Mais" expande para: Financeiro, Clientes, Regras de Horários, Configurações, Ajuda, Sair.

---

## 11. Observações e Pendências

### Páginas importadas mas não utilizadas nas rotas
- `GestorDashboardPageMobile` — importado em `App.jsx` mas não aparece em nenhuma rota.

### Páginas existentes sem rota em `App.jsx`
- `AdminAgendaEditPage` — existe no diretório mas não está mapeada.
- `GestorMobileConfiguracoesPage` — existe mas as rotas de configurações usam apenas a versão desktop.
- `GestorMobileFinanceiroPage` — existe mas a rota de financeiro usa apenas a versão desktop.

### Inconsistências a resolver
- `EsqueciSenhaPage`, `ResetarSenhaPage` e `TrocarSenhaPage` importam o cliente HTTP de `services/api.js` em vez de usar `authApi` diretamente.
- Notificações no header (tanto `GestorLayout` quanto `MobileLayout`) usam `mockContatos` e `mockNovaReserva` em vez de dados reais — será necessário um endpoint ou WebSocket para notificações em tempo real.

### Formatos que o backend DEVE respeitar
- **Datas:** `YYYY-MM-DD` (ISO)
- **Horas:** `HH:MM:SS` ou `HH:MM`
- **Valores monetários:** `number` (ponto como separador decimal, ex: `1234.56`)
- **Status de reserva/pagamento:** `"paid"`, `"pending"`, `"canceled"` (em inglês, minúsculas)
- **Tipo de usuário:** `"admin"` ou `"gestor"` (minúsculas)
- **Upload de fotos:** Aceitar `multipart/form-data`
- **Export de relatórios:** Retornar como `blob` (arquivo binário)

### Token e autenticação
- O token JWT deve ser enviado no header `Authorization: Bearer <token>`.
- Se o token estiver expirado, o backend deve retornar **401** (o frontend faz logout automático).
- O endpoint `GET /auth/validar-token` deve retornar **200** se o token for válido.

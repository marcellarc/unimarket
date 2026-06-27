# UniMarket

## Segredos e variaveis de ambiente

Nao versione credenciais reais em `application.properties`, `.env`, `email.properties` ou `application-local.properties`.
O backend de producao le segredos por variaveis de ambiente, alinhadas com o `systemd` da VM:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `API_SECURITY_TOKEN_SECRET`
- `SPRING_MAIL_HOST`
- `SPRING_MAIL_PORT`
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`
- `MAIL_FROM`
- `APP_GOOGLE_MAPS_API_KEY`
- `APP_GOOGLE_OAUTH_CLIENT_ID`
- `COSMOS_API_URL`
- `COSMOS_API_TOKEN`
- `COSMOS_API_USER_AGENT`

Antes de commitar, rode:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\check-secrets.ps1
```

Para bloquear commits locais com segredos obvios, configure os hooks versionados uma vez:

```bash
git config core.hooksPath .githooks
```

O GitHub Actions tambem executa essa checagem em `push` e `pull_request`.

O UniMarket é uma aplicação web para comparação de preços em supermercados locais. O projeto conecta consumidores a mercados próximos, ajuda no planejamento de compras e oferece ferramentas para supermercados gerenciarem produtos, preços, estoque e dados cadastrais.


## Objetivo

Desenvolver uma solução acessível, segura e intuitiva para apoiar consumidores na tomada de decisão durante compras de mercado, promovendo economia, organização e transparência. Para supermercados, o UniMarket oferece um ambiente de gestão para manter catálogo, preços e informações institucionais atualizados.

## Criadores

Projeto acadêmico desenvolvido por:

- Beatriz Duarte Sibilio
- Kayo Campos Silva
- Marcella Ricoy Curci de Moura

Orientação: Rui Silvestrin.

## Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, TanStack Router e TanStack Query.
- **Backend:** Java 21, Spring Boot, Spring Security, JWT, JPA/Hibernate e PostgreSQL.
- **APIs externas:** BrasilAPI para CEP/CNPJ e integração opcional com Google Maps/Geocoding.
- **Documentação:** Swagger/OpenAPI.
- **Ferramentas:** Maven, Node.js, npm e Git.

## Funcionalidades

### Implementadas

#### Autenticação e Navegação

- Login e cadastro para clientes e supermercados.
- Controle de sessão com JWT.
- Acesso como visitante para exploração do dashboard do cliente.
- Páginas institucionais:
  - `/about`: informações sobre o projeto e seus criadores.
  - `/help`: dúvidas frequentes e contato com o suporte.

#### Cliente

- Dashboard com identidade visual do UniMarket, busca, filtros e skeletons de carregamento.
- Perfil editável com nome, e-mail, foto/avatar, senha, notificações e localidade de compra.
- Consulta de CEP pela BrasilAPI para preenchimento de endereço, cidade e UF.
- Filtro de supermercados próximos por CEP, cidade/UF e coordenadas quando disponíveis.
- Comparação de produtos por mercado, incluindo preço e distância em relação ao cliente.
- Modal para criação de nova lista de compras.
- Alertas de preço e notificações para produtos monitorados.

#### Supermercado

- Dashboard administrativo com visão geral, produtos, avaliações e configurações.
- Cadastro e edição de produtos vinculados ao mercado.
- Atualização de preço e estoque.
- Perfil/configurações do mercado com CNPJ, endereço, localidade e links de mapa.
- Sincronização cadastral por CNPJ via BrasilAPI.

#### Backend/API

- Endpoints de autenticação para cliente e supermercado.
- Endpoints de perfil do cliente e do mercado.
- Endpoints de produtos por mercado.
- Endpoint de consulta de CEP.
- Endpoint de mercados próximos.
- Endpoints de alertas e notificações de preço.
- Documentação da API com Swagger/OpenAPI.

## Rotas Principais do Frontend

- `/`: redireciona conforme o estado de autenticação.
- `/login`: entrada de clientes e supermercados.
- `/register`: cadastro de clientes e supermercados.
- `/dashboard`: área principal do usuário autenticado, mercado ou visitante.
- `/profile`: perfil do cliente.
- `/about`: apresentação do projeto.
- `/help`: central de ajuda.

## Como Executar

### Pré-requisitos

- Java 21+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 13+

### Backend

```bash
cd backend
./mvnw clean test
./mvnw spring-boot:run
```

No Windows, também é possível usar `mvn.cmd`, conforme a configuração local.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Banco de Dados e Configuração

- Configure o PostgreSQL em `backend/src/main/resources/application.properties`.
- Em desenvolvimento, o projeto usa `spring.jpa.hibernate.ddl-auto=update`.
- Credenciais sensíveis devem ficar em variáveis de ambiente ou arquivos locais não versionados.

Variáveis úteis:

- `JWT_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM`

## Estrutura do Projeto

```text
unimarket/
|-- backend/
|   `-- src/main/java/com/unimarket/backend/
|       |-- config/
|       |-- controller/
|       |-- dto/
|       |-- entity/
|       |-- repository/
|       `-- service/
|-- frontend/
|   `-- src/
|       |-- api/
|       |-- assets/
|       |-- components/
|       |-- hooks/
|       |-- pages/
|       |-- routes/
|       |-- services/
|       |-- types/
|       `-- utils/
`-- README.md
```

## Validação

Comandos usados para validar alterações recentes:

```bash
cd frontend
npm run build

cd ../backend
./mvnw clean test
```

## Observações

- A precisão da distância depende das coordenadas disponíveis para cliente e mercado.
- Quando não há coordenadas, o sistema usa CEP, cidade e UF como fallback de localidade.
- O modo visitante permite explorar a experiência, mas perfil, alertas e persistência completa exigem login.
- O e-mail de suporte do projeto é `unimarketsup@gmail.com`.

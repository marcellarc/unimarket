# UniMarket

Sistema web para comparação de preços em supermercados locais, conectando consumidores a ofertas competitivas e ajudando supermercados a gerenciarem seus catálogos de produtos.

## Tecnologias Utilizadas

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
- **Backend:** Java 21 + Spring Boot + JPA/Hibernate + PostgreSQL + Spring Security + JWT
- **Ferramentas:** Maven, Node.js, Git

## Funcionalidades

### ✅ Implementadas

#### Autenticação e Autorização
- Login e registro para usuários e supermercados
- Controle de acesso baseado em roles (USER/MARKET)
- JWT para sessões seguras

#### Dashboard do Usuário
- Visualização de produtos de um supermercado específico
- Busca de produtos por nome (server-side)
- Filtros por categoria (local)
- Exibição de preços, estoques e informações do mercado
- Interface responsiva com navegação intuitiva

#### Dashboard do Supermercado
- Gerenciamento de catálogo de produtos
- Criação de produtos com nome, marca, categoria, preço e estoque
- Edição de preços e estoques existentes
- Listagem de produtos com busca server-side
- Filtros por marca (local)
- Visualização de últimas atualizações

#### APIs REST
- Endpoints para produtos, mercados e usuários
- CRUD básico para produtos por mercado
- Busca de produtos dentro de um mercado
- Validação de dados com DTOs

### 🚧 Pendentes / Em Desenvolvimento

#### Funcionalidades do Usuário
- **Comparação de preços** entre múltiplos mercados
- **Lista de compras** com itens salvos e cálculo de total
- **Histórico de buscas** e recomendações personalizadas
- **Avaliações e comentários** em produtos e mercados
- **Notificações** de promoções e ofertas
- **Filtragem por localidade** para localizar mercados próximos

#### Funcionalidades do Supermercado
- **Atualização de produtos** do catálogo (preço + estoque)
- **Relatórios de buscas** e vendas
- **Análise de concorrência** com preços de outros mercados

#### Infraestrutura e Qualidade
- **Testes unitários e de integração** (backend e frontend)
- **Documentação da API** com Swagger/OpenAPI
- **Deploy automatizado** com CI/CD
- **Monitoramento e logs** centralizados
- **Otimização de performance** (cache, lazy loading)
- **Acessibilidade** (WCAG compliance)

## Como Executar

### Pré-requisitos
- Java 21+
- Node.js 18+
- PostgreSQL 13+
- Maven 3.8+

### Backend
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Banco de Dados
- Configure PostgreSQL com banco `unimarket`
- As tabelas são criadas automaticamente via JPA
- Dados iniciais em `backend/src/main/resources/insertsTeste.sql`

## Estrutura do Projeto

```
unimarket/
├── backend/
│   ├── src/main/java/com/unimarket/backend/
│   │   ├── config/          # Configurações Spring
│   │   ├── controller/      # Endpoints REST
│   │   ├── entity/          # Entidades JPA
│   │   ├── repository/      # Repositórios
│   │   ├── service/         # Lógica de negócio
│   │   └── security/        # Autenticação/Autorização
│   └── src/main/resources/
│       ├── application.properties
│       └── insertsTeste.sql         # Dados iniciais
├── frontend/
│   ├── src/
│   │   ├── api/             # Cliente HTTP
│   │   ├── components/      # Componentes UI
│   │   ├── hooks/           # Hooks customizados
│   │   ├── pages/           # Páginas e layouts
│   │   ├── services/        # Chamadas de API
│   │   └── types/           # Tipos TypeScript
│   └── public/              # Assets estáticos
└── README.md
```

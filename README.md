# UniMarket

O **UniMarket** é uma aplicação web desenvolvida para auxiliar consumidores na busca e comparação de preços de produtos em supermercados. A plataforma centraliza informações de produtos, preços e mercados, permitindo que o usuário planeje suas compras com mais praticidade antes de se deslocar até o estabelecimento.

Além da experiência voltada ao consumidor, o sistema também oferece um painel administrativo para supermercados gerenciarem produtos, preços, estoque, avaliações e dados cadastrais.

---

## Contexto do projeto

A ideia do UniMarket surgiu ainda no 2º semestre da faculdade, a partir da percepção de uma dificuldade comum no dia a dia: comparar preços entre supermercados ainda é, muitas vezes, um processo manual, demorado e pouco centralizado.

Com o aumento do custo de vida e a necessidade de compras mais planejadas, o projeto foi desenvolvido com o objetivo de apoiar consumidores na tomada de decisão, reunindo em uma única plataforma informações como preço, mercado, localização, listas de compras e alertas.

O projeto foi apresentado como Trabalho de Conclusão de Curso em Análise e Desenvolvimento de Sistemas.

---

## Objetivo

Desenvolver uma aplicação web acessível, segura e intuitiva para facilitar a busca, consulta e comparação de preços de produtos em supermercados.

O UniMarket busca contribuir para:

* economia de tempo;
* planejamento financeiro;
* decisões de compra mais conscientes;
* maior organização das informações de consumo;
* aproximação entre consumidores e supermercados locais.

---

## Principais funcionalidades

### Acesso como visitante

O visitante pode explorar parte da plataforma sem precisar criar uma conta.

* Visualização de produtos disponíveis.
* Comparação de preços entre mercados.
* Acesso limitado às funcionalidades que não exigem persistência de dados.

Funcionalidades como listas, alertas, perfil e avaliações exigem autenticação.

---

### Cliente

O perfil de cliente é voltado ao consumidor final que deseja pesquisar, comparar e planejar suas compras.

Funcionalidades disponíveis:

* cadastro e login de clientes;
* acesso ao dashboard principal;
* busca de produtos por nome;
* aplicação de filtros;
* comparação de preços entre supermercados;
* visualização de informações do mercado;
* criação de listas de compras;
* escolha de ofertas específicas para adicionar à lista;
* criação de alertas de preço;
* recebimento de notificações relacionadas aos alertas;
* envio de avaliações e feedbacks;
* edição de perfil;
* configuração de localização e preferências.

---

### Supermercado

O perfil de supermercado é voltado à gestão das informações exibidas aos clientes.

Funcionalidades disponíveis:

* cadastro e login de supermercados;
* painel administrativo próprio;
* visão geral do catálogo;
* cadastro de produtos;
* edição de produtos;
* atualização de preço e estoque;
* acompanhamento de produtos com estoque baixo;
* gerenciamento de dados cadastrais;
* consulta e visualização de avaliações recebidas;
* configuração de endereço e localização.

---

## Como funciona a comparação de preços

A comparação de preços no UniMarket é baseada no vínculo entre **produto** e **supermercado**.

Um mesmo produto pode estar disponível em diferentes mercados, com preços e estoques próprios em cada estabelecimento. Dessa forma, o sistema permite que o usuário compare ofertas reais de um mesmo item, considerando não apenas o preço, mas também o mercado responsável e informações de localização quando disponíveis.

Para reduzir duplicidades no cadastro, o sistema utiliza o **código de barras** como apoio à padronização dos produtos.

---

## Tecnologias utilizadas

### Front-end

* React
* TypeScript
* Vite
* TailwindCSS
* TanStack Router
* TanStack Query

### Back-end

* Java 21
* Spring Boot
* Spring Security
* JWT
* JPA/Hibernate
* PostgreSQL

### APIs e integrações

* BrasilAPI para consulta de CEP e CNPJ
* Bluesoft Cosmos para apoio ao cadastro de produtos por código de barras
* Google Maps/Geocoding para recursos de localização
* Swagger/OpenAPI para documentação da API

### Ferramentas de apoio

* Git e GitHub
* Maven
* Node.js
* npm
* Figma
* Trello
* Vercel
* Aiven
* Oracle Cloud

---

## Arquitetura geral

O UniMarket foi desenvolvido com separação entre front-end e back-end.

O **front-end** é responsável pela interface do usuário, navegação, formulários, dashboards e interação com os perfis de visitante, cliente e supermercado.

O **back-end** é responsável pelas regras de negócio, autenticação, autorização, persistência dos dados e comunicação com serviços externos.

O banco de dados armazena informações como:

* clientes;
* supermercados;
* produtos;
* categorias;
* preços;
* estoque;
* listas de compras;
* alertas;
* avaliações;
* dados de localização.

---

## Rotas principais

### Rotas públicas

* `/login` — login de clientes e supermercados
* `/register` — cadastro de clientes e supermercados
* `/about` — informações sobre o projeto
* `/help` — central de ajuda

### Rotas do cliente

* `/dashboard` — dashboard principal com busca e comparação de produtos
* `/profile` — perfil do cliente

### Rotas do supermercado

* `/dashboard` — painel administrativo do supermercado

---

## Executando o projeto localmente

Como o projeto já está disponível em produção, a execução local é necessária apenas para desenvolvimento, testes ou contribuição no código.

### Pré-requisitos

* Java 21+
* Maven 3.8+
* Node.js 18+
* PostgreSQL 13+
* Git

---

### Back-end

Acesse a pasta do back-end:

```bash
cd backend
```

Execute os testes:

```bash
./mvnw clean test
```

Inicie a aplicação:

```bash
./mvnw spring-boot:run
```

No Windows, também é possível utilizar:

```bash
mvn.cmd spring-boot:run
```

---

### Front-end

Acesse a pasta do front-end:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

---

## Variáveis de ambiente

Algumas configurações sensíveis devem ser mantidas fora do versionamento, utilizando variáveis de ambiente ou arquivos locais não enviados ao repositório.

Exemplos de variáveis utilizadas:

```env
JWT_SECRET=
GOOGLE_MAPS_API_KEY=
MAIL_USERNAME=

MAIL_FROM=
```

Também é necessário configurar a conexão com o banco de dados PostgreSQL no ambiente do back-end.

---

## Validação do projeto

Comandos utilizados para validar alterações no projeto:

### Front-end

```bash
cd frontend
npm run build
```

### Back-end

```bash
cd backend
./mvnw clean test
```

---

## Estrutura do projeto

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
|
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
|
`-- README.md
```

---

## Limitações e melhorias futuras

O UniMarket foi desenvolvido como um projeto acadêmico funcional, mas algumas evoluções podem tornar a plataforma mais robusta para um cenário real de uso.

Melhorias futuras previstas:

* histórico de preços dos produtos;
* registro da data da última atualização de preço;
* auditoria de alterações feitas por supermercados;
* validação cruzada de dados;
* sugestões automáticas da lista de compras mais econômica;
* melhoria nos mecanismos de notificação;
* ampliação dos testes com usuários reais;
* maior controle sobre atualização de estoque e disponibilidade.

---

## Desenvolvedores

Projeto acadêmico desenvolvido por:

* Beatriz Duarte Sibilio
* Kayo Campos Silva
* Marcella Ricoy Curci de Moura

Orientador:

* Rui Silvestrin

---

## Contato

E-mail de suporte do projeto:

`unimarketsup@gmail.com`

---

## Status do projeto

Projeto desenvolvido e apresentado como Trabalho de Conclusão de Curso.

Disponível em: (unimarket-app.vercel.app)

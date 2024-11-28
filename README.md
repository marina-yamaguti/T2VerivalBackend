# Polymathech

## Requisitos

- [Node.js](https://nodejs.org) (LTS)
- [Docker](https://www.docker.com/) (opcional)
- [PostgreSQL](https://www.postgresql.org/) (opcional caso esteja utilizando Docker)
- Caso utilize o [VSCode](https://code.visualstudio.com/) como IDE, adicione as extensões (ver arquivo .vscode/extensions.json)
    - ESLint
    - Prisma
    - EditorConfig for VS Code
    - REST Client (opcional)
    - vscode-icons (opcional)
    - Docker (opcional)

## Configuração Inicial

### Delimitadores de linha do Git

```
git config --local core.autocrlf false
git config --local core.safecrlf false
```

### Dependências do projeto

Após clonar o repositório ou criar uma nova branch, instale/atualize as dependências do projeto utilizando o comando `npm install` ou `npm i`

### Base de dados com Docker

Primeiramente execute o Docker em sua máquina local. Após, crie um diretório na raiz do projeto com o nome `data` e em seguida abra um terminal na raiz do projeto e execute o comando `docker-compose up -d`

### Variáveis do projeto

Copie o arquivo `.env.example` para o mesmo diretório e altere o nome da cópia para `.env`. Abra o arquivo `.env` e atualize as variáveis contidas dentro deste arquivo.

## Migrações

Para executar uma migração com o Prisma, utilize o comando `npx prisma migrate dev` e dê um nome para sua migração

É possível acessar as entidades do banco de dados através do browser. Para isso, abra um terminal na raiz do projeto e execute o comando `npx prisma studio`

## Executando o projeto

Abra um terminal na raiz do projeto e execute o comando `npm run start:dev`

## Contribuindo para o projeto

Entre em nossa [página da Wiki](https://tools.ages.pucrs.br/polymathech/wiki/-/wikis/processo) e veja o paso a passo para iniciar uma contribuição neste projeto.


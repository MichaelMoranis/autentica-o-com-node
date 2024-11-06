# Apredendo construção de apis com node e typescript

## Configuração de typescript com node js para rodar o servidor ou mostrar algo na tela.

## Passo 1. Para inicializar o projeto e instalar dependencias.

```shell
npm init -y 
```
para criar um arquivo package.json.

2. instalação do typescript e os tipos para node js.

```shell
npm install typescript @types/node --save-dev
```

### Passo 2. Criar arquivo de configuração tsconfig.json

#### 1. Esse arquivo vai servir para configurações principais do do node js.

rode o comando: 

```shell
npx tsc --init 
```

#### 3. configurações principais do node js com ts no arquivo tsconfig.json .

```json
{
  "compilerOptions": {

    "target": "es2016",                                  
    "skipLibCheck": true,
    "module": "CommonJS",
    "outDir": "./dist",
    "strict": false,
    "esModuleInterop": false,
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```
#### 4. configuração de scripts para compilação e execução no package.json.

```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
}
```

### Usar ts-node-dev para rodar codigo em desenvolvimento recompilando automaticamente ao detectar alterações.

#### Instalação do ts-node-dev.

```shell
npm install ts-node-dev --save-dev
```

## Pequeno exemplo de um servidor apenas usando node js sem libs externas.

```ts

import { createServer } from 'node:http'

const server = createServer((request, response) => {
    console.log("hello")

    response.write('michael esta no servidor')
   return  response.end()
})


server.listen(3333)
```

## Utilização de frameworks para desenvolvimento de Apis em especial o uso do Fastify

### Instalação do Fastify no projeto.

1. Rode o comando: 

```shell
npm install fastify 
```

2. O uso do Fastify vai facilitar o desenvolvimento da api porque simplifica a escrita do codigo e facilita o redirecionamento das rotas no projeto.

#### Exemplo em urls 

Urls com metodo post, delete, get e put as mais usadas.

// POST localhost:3333/videos 
// DELETE localhost:3333/videos/1 no caso de ter um id especifico para itens usa-se o especificador dele 


### Exemplo de uso do fastify para criação de rotas ou endpoints 


```ts
import { fastify } from 'fastify'

const server = fastify()

server.get('/', () => {
    return "hello"
})

server.listen({
    port: 3333
})
```

### Principais operações feitas usando apis é o famoso CRUD (create, read, update, delete)

#### No crud refletido no codigo será o uso dos metodos http POST PUT DELETE GET


## Para fins de estudos vou utilizar primeiramente um banco de dados em memória, usando uma estrutura de dados.

1. Crio um novo arquivo chamado database-memory.ts e crio minha classe que será meu banco de dados em memória.

```ts
import { randomUUID } from "node:crypto"

export class DataBaseMemory {
    #videos = new Map()

    list() {
        return this.#videos.values()
    }

    create(video) {
        const videoId = randomUUID()

        this.#videos.set(videoId, video)
    }

    update(id, video) {        
        this.#videos.set(id, video)
    }

    delete(id) {
        this.#videos.delete(id)
    }
}
```

1. Na utilização do metodo post para enviar dados para ser armazenado ou modificado com metodos do tipo PUT deve enviar dados no corpo da requisição por meio do uso de request.body veja exemplo:


```ts
import { fastify } from 'fastify'
import { DataBaseMemory } from '../database/databaseMemory'

const server = fastify()

const database = new DataBaseMemory()

server.post('/persona', (request, reply) => {
    const {title, description, age } = request.body

    database.create({
        title,
        description,
        age
    })

    console.log(database.list())

    return reply.status(201).send()
})
```

## API completa com todas as rotas configuradas e funcionando no banco de dados em memória.

```ts
import { fastify } from 'fastify'
import { DataBaseMemory } from '../database/databaseMemory'

const server = fastify()

const database = new DataBaseMemory()

server.post('/persona', (request, reply) => {
    const {title, description, age } = request.body

    database.create({
        title,
        description,
        age
    })

    console.log(database.list())

    return reply.status(201).send()
})

server.get('/persona', () => {
    const persona = database.list()

    console.log(persona)
    return persona
})

server.put('/persona/:id', (request, reply) => {
    const {title, description, age } = request.body
    const personaId = request.params.id

   database.update(personaId, {
        title,
        description,
        age
    })

    return reply.status(204).send()
})

server.delete('/persona/:id', (request, reply) => {
    const personaId = request.params.id
    database.delete(personaId)
    return reply.status(200).send()
})


server.listen({
    port: 3333
})
```

## Processo de desenvolvimento Autorização com JWT (jasonwebtoken) e bcrypt.

1. Instalação das ferramentas. 

```shell
npm install bcrypt jsonwebtoken
```

com TypeScript ficaria assim 

```shell
npm i --save-dev @types/bcrypt
```

deve-se instalar tambem os tipos do bcrypt para o typescript.

2. Estrutura do projeto.

- src
  - server.js       # Principal servidor Fastify
  - databaseMemory.js  # "Banco de dados" em memória
  - config.js       # Configuração do JWT


### Explicação das partes codigo de Autorização.


 ####   Registro de Usuário (/register):
        Recebe username e password do usuário.
        Hasheia a senha com bcrypt e armazena o usuário no banco de dados em memória.
        Retorna um status 201 ao concluir com sucesso.

####    Login do Usuário (/login):
        Recebe username e password.
        Verifica se o usuário existe e se a senha bate.
        Gera um token JWT com o username como payload e define um tempo de expiração de 1 hora.
        Retorna o token JWT ao cliente para autenticação nas rotas.

####    Middleware verifyToken:
        Verifica se o token JWT está presente e válido em cada requisição.
        Caso não seja válido, bloqueia o acesso com status 403 ou 401.

####    Rotas Protegidas:
        As rotas CRUD de persona (/persona) agora exigem autenticação.
        Cada rota usa o middleware verifyToken para garantir que apenas usuários autenticados possam acessar.

#### Testando a Autenticação

    Registrar um Usuário:
        Envie uma requisição POST para /register com username e password.
        Exemplo de payload:

```json
    { "username": "meuusuario", "password": "minhasenha" }
``` 

Logar:

    Envie uma requisição POST para /login com o mesmo username e password.
    Receba o token JWT na resposta.

Usar o Token:

    Em rotas protegidas, adicione o token no cabeçalho Authorization:

    makefile

Authorization: Bearer <seu_token_jwt>








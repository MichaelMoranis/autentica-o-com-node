import { fastify } from "fastify";
import { DataBaseMemory } from "./database/databaseMemory";
import * as bcrypt from "bcrypt";
import { JWT_SECRET } from "./config";
import * as jwt from "jsonwebtoken";
import { PersonaData, UserData, PersonaParams } from "./types ";

const server = fastify();

const database = new DataBaseMemory();

server.post<{ Body: PersonaData }>(
  "/persona",
  { preHandler: verifyToken },
  (request, reply) => {
    const { title, description, age } = request.body;

    database.create({
      title,
      description,
      age,
    });

    console.log(database.list());
    return reply.status(201).send();
  },
);

server.get("/persona", { preHandler: verifyToken }, () => {
  const persona = database.list();

  console.log(persona);

  return persona;
});

server.put<{ Body: PersonaData; Params: PersonaParams }>(
  "/persona/:id",
  { preHandler: verifyToken },
  (request, reply) => {
    const { title, description, age } = request.body;
    const personaId = request.params.id;

    database.update(personaId, {
      title,
      description,
      age,
    });

    return reply.status(204).send();
  },
);

server.delete<{ Params: PersonaParams }>(
  "/persona/:id",
  { preHandler: verifyToken },
  (request, reply) => {
    const personaId = request.params.id;
    database.delete(personaId);
    return reply.status(200).send();
  },
);

// rotas de criação de usuarios
server.post<{ Body: UserData }>("/register", async (request, reply) => {
  const { username, password } = request.body;

  if (database.findUserByUsername(username)) {
    return reply.status(400).send({ error: "usuario ja existe" });
  }

  const userId = await database.createUser({ username, password });

  return reply
    .status(201)
    .send({ userId, message: "usuario registrado com sucesso !!" });
});

// rotas de login
server.post<{ Body: UserData }>("/login", async (request, reply) => {
  const { username, password } = request.body;
  const user = database.findUserByUsername(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return reply.status(401).send({ error: "credenciais invalidas !!!!" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  return reply.send({ token });
});

// função para ter rotas crud protegidas
function verifyToken(request, reply, done) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return reply.status(401).send({ error: "token ausente" });

  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) return reply.status(403).send({ error: "token invalido" });

    request.user = user;
    done();
  });
  console.log("cabecalhos", authHeader);
}

server.listen({ port: 3333 }, (erro, adress) => {
  if (erro) {
    console.error(erro);
    process.exit(1);
  }
  console.log(`servidor rodando em ${adress}`);
});


import { conectar } from './redis.js';
import { FilaRedis } from './fila-redis.js';

const workerId = process.argv[2] ?? 'worker-1';
const client = await conectar();
const bloqueante = await client.duplicate().connect();
const fila = new FilaRedis(client, 'fila:emails', { maxTentativas: 3 });

async function enviarEmail({ para, assunto }) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (para.endsWith('@invalido.com')) throw new Error('domínio inexistente');
  console.log(`[${workerId}] e-mail "${assunto}" enviado para ${para}`);
}

let rodando = true;
for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, () => {
    console.log(`[${workerId}] encerrando após a tarefa atual...`);
    rodando = false;
  });
}

const recuperadas = await fila.recuperar(workerId);
if (recuperadas) console.log(`[${workerId}] ${recuperadas} tarefa(s) recuperada(s)`);

console.log(`[${workerId}] aguardando tarefas`);
try {
  await fila.consumir(bloqueante, workerId, enviarEmail, () => rodando);
} finally {
  await bloqueante.close();
  await client.close();
}

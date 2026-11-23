import { conectar } from '../09-node-redis/redis.js';

const client = await conectar();
const agenda = 'exemplo:fila:agendada';
const fila = 'exemplo:fila:emails';

async function agendar(tarefa, ms) {
  await client.zAdd(agenda, {
    score: Date.now() + ms,
    value: JSON.stringify(tarefa),
  });
}

async function moverVencidas() {
  const vencidas = await client.zRange(agenda, '-inf', Date.now(), {
    BY: 'SCORE',
    LIMIT: { offset: 0, count: 100 },
  });
  for (const tarefa of vencidas) {
    if ((await client.zRem(agenda, tarefa)) === 1) {
      await client.lPush(fila, tarefa);
    }
  }
  return vencidas.length;
}

try {
  await client.del([agenda, fila]);
  await agendar({ id: 1, assunto: 'Lembrete da prova' }, 1000);
  await agendar({ id: 2, assunto: 'Resultado' }, 60_000);
  console.log('agora:', await moverVencidas());
  await new Promise((resolve) => setTimeout(resolve, 1100));
  console.log('após 1,1 s:', await moverVencidas());
  console.log('fila:', await client.lRange(fila, 0, -1));
  console.log('ainda agendadas:', await client.zCard(agenda));
} finally {
  await client.close();
}

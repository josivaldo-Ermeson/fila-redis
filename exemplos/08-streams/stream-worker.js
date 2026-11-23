import { conectar } from '../09-node-redis/redis.js';

const STREAM = 'exemplo:fila:pedidos';
const GRUPO = 'cozinha';
const CONSUMIDOR = process.argv[2] ?? `worker-${process.pid}`;

const client = await conectar();
try {
  await client.xGroupCreate(STREAM, GRUPO, '0', { MKSTREAM: true });
} catch (erro) {
  if (!erro.message.includes('BUSYGROUP')) throw erro;
}

const bloqueante = await client.duplicate().connect();
let rodando = true;
process.once('SIGINT', () => { rodando = false; });
process.once('SIGTERM', () => { rodando = false; });

async function processar(pedido) {
  console.log(`[${CONSUMIDOR}] preparando pedido ${pedido.pedido} de ${pedido.cliente}`);
  await new Promise((resolve) => setTimeout(resolve, 200));
}

try {
  while (rodando) {
    const resposta = await bloqueante.xReadGroup(
      GRUPO, CONSUMIDOR,
      { key: STREAM, id: '>' },
      { COUNT: 10, BLOCK: 2000 },
    );
    if (!resposta) continue;

    for (const { id, message } of resposta[0].messages) {
      await processar(message);
      await client.xAck(STREAM, GRUPO, id);
    }
  }
} finally {
  await bloqueante.close();
  await client.close();
}

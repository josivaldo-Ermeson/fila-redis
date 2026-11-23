import { conectar } from '../09-node-redis/redis.js';

const client = await conectar();
const bloqueante = await client.duplicate().connect();

try {
  const resposta = await bloqueante.brPop('exemplo:espera', 0);
  console.log('recebida:', resposta.key, JSON.parse(resposta.element));
} finally {
  await bloqueante.close();
  await client.close();
}

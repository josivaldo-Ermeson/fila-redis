import { conectar } from '../09-node-redis/redis.js';

const client = await conectar();
const stream = 'exemplo:fila:pedidos';

for (const [pedido, cliente] of [[101, 'ana'], [102, 'bruno'], [103, 'caio']]) {
  const id = await client.xAdd(
    stream,
    '*',
    { pedido: String(pedido), cliente },
    { TRIM: { strategy: 'MAXLEN', strategyModifier: '~', threshold: 10_000 } },
  );
  console.log('publicado', id);
}
await client.close();

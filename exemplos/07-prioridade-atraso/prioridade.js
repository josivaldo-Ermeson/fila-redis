import { conectar } from '../09-node-redis/redis.js';

const client = await conectar();
const prioridade = 'exemplo:fila:suporte';
const filas = ['exemplo:fila:alta', 'exemplo:fila:normal', 'exemplo:fila:baixa'];
await client.del([prioridade, ...filas]);

await client.zAdd(prioridade, [
  { score: 3, value: 'ticket-a' },
  { score: 1, value: 'ticket-b' },
  { score: 2, value: 'ticket-c' },
  { score: 1, value: 'ticket-d' },
]);
console.log('Sorted Set (menor score primeiro):', await client.zPopMin(prioridade));
console.log('próximo:', await client.zPopMin(prioridade));

await client.lPush(filas[2], 'relatorio');
await client.lPush(filas[1], 'email');
await client.lPush(filas[0], 'senha');
for (let i = 0; i < filas.length; i++) {
  console.log('BRPOP por nível:', await client.brPop(filas, 1));
}

await client.close();

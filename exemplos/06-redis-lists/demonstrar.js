import { conectar } from '../09-node-redis/redis.js';

const client = await conectar();
const prefixo = 'exemplo:lists';
const fila = `${prefixo}:fila`;
const confiavel = `${prefixo}:confiavel`;
const processando = `${prefixo}:processando`;

await client.del([fila, confiavel, processando]);
await client.lPush(fila, ['a', 'b', 'c']);
console.log('LPUSH + LRANGE:', await client.lRange(fila, 0, -1));
console.log('RPOP:', await client.rPop(fila));
console.log('LLEN:', await client.lLen(fila));

const item = JSON.stringify({ id: 1, para: 'ana@ex.com' });
await client.lPush(confiavel, item);
const movida = await client.lMove(confiavel, processando, 'RIGHT', 'LEFT');
console.log('BLMOVE/LMOVE moveu:', movida);
console.log('LREM confirma:', await client.lRem(processando, 1, item));
await client.close();

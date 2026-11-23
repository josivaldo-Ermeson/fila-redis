import { conectar } from '../09-node-redis/redis.js';

const client = await conectar();
await client.lPush('exemplo:espera', JSON.stringify({ texto: 'tarefa de demonstração' }));
console.log('tarefa enfileirada');
await client.close();

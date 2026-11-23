import { conectar } from './redis.js';

const client = await conectar();
try {
  await client.set('exemplo:aluno:1:nome', 'Maria');
  console.log(await client.get('exemplo:aluno:1:nome'));

  await client.hSet('exemplo:aluno:1', { nome: 'Maria', curso: 'TSI', periodo: 3 });
  console.log(await client.hGetAll('exemplo:aluno:1'));

  const fila = 'exemplo:fila:emails';
  await client.del(fila);
  await client.lPush(fila, JSON.stringify({ para: 'ana@ex.com', assunto: 'Oi' }));
  const item = await client.rPop(fila);
  console.log(JSON.parse(item));

  const [tamanho, total] = await client
    .multi()
    .lPush(fila, 'a')
    .incr('exemplo:stats:enfileirados')
    .exec();
  console.log(tamanho, total);
} finally {
  await client.close();
}

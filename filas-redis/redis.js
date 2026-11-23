import { createClient } from 'redis';

export async function conectar() {
  const client = createClient({
    url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
  });

  client.on('error', (erro) => console.error('[redis] erro:', erro.message));
  await client.connect();
  return client;
}

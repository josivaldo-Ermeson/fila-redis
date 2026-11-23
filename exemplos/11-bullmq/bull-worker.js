import { Worker, Queue } from 'bullmq';

const connection = { host: 'localhost', port: 6379 };
const nomeFila = 'exemplo-emails';
const fila = new Queue(nomeFila, { connection });
const worker = new Worker(
  nomeFila,
  async (job) => {
    const { para } = job.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (para.endsWith('@invalido.com')) throw new Error('domínio inexistente');
    return { enviadoEm: new Date().toISOString() };
  },
  { connection, concurrency: 5 },
);

worker.on('completed', (job) => console.log(`ok   #${job.id} ${job.name} -> ${job.data.para}`));
worker.on('failed', (job, erro) => {
  console.log(`erro #${job?.id} tentativa ${job?.attemptsMade}/${job?.opts.attempts ?? 1}: ${erro.message}`);
});

let encerrando = false;
async function encerrar() {
  if (encerrando) return;
  encerrando = true;
  await worker.close();
  console.log('falhas consultáveis:', (await fila.getFailed()).map((job) => ({
    id: job.id, nome: job.name, tentativas: job.attemptsMade, erro: job.failedReason,
  })));
  await fila.close();
}
process.once('SIGINT', encerrar);
process.once('SIGTERM', encerrar);

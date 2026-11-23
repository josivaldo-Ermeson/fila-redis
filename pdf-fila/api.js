import express from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { conectar } from './redis.js';
import { K, publicar } from './chaves.js';

await mkdir('uploads', { recursive: true });
const client = await conectar();
const app = express();
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
  fileFilter: (_req, arquivo, aceitar) => aceitar(null, arquivo.mimetype === 'application/pdf'),
});

app.use(express.static('public'));

app.post('/pdfs', upload.array('arquivos', 10), async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ erro: 'Envie ao menos um arquivo PDF.' });
    }

    const criados = [];
    for (const arquivo of req.files) {
      const id = randomUUID();
      const agora = Date.now();
      const nome = Buffer.from(arquivo.originalname, 'latin1').toString('utf8');

      await client
        .multi()
        .hSet(K.job(id), {
          id,
          nome,
          caminho: arquivo.path,
          bytes: arquivo.size,
          status: 'na_fila',
          tentativas: 0,
          criadoEm: agora,
        })
        .zAdd(K.jobs, { score: agora, value: id })
        .lPush(K.fila, id)
        .exec();

      await publicar(client, 'na_fila', { id, nome });
      criados.push({ id, nome });
    }

    return res.status(202).json(criados);
  } catch (erro) {
    return next(erro);
  }
});

app.get('/pdfs/:id', async (req, res, next) => {
  try {
    const job = await client.hGetAll(K.job(req.params.id));
    if (!job.id) return res.status(404).json({ erro: 'Job não encontrado.' });
    return res.json(job);
  } catch (erro) {
    return next(erro);
  }
});

app.get('/pdfs/:id/texto', async (req, res, next) => {
  try {
    const job = await client.hGetAll(K.job(req.params.id));
    if (job.status !== 'concluido') {
      return res.status(409).json({ erro: `O job está "${job.status ?? 'inexistente'}".` });
    }
    return res.type('text/plain; charset=utf-8').sendFile(job.resultado, { root: process.cwd() });
  } catch (erro) {
    return next(erro);
  }
});

app.use((erro, _req, res, _next) => {
  console.error(erro);
  res.status(400).json({ erro: erro.message });
});

const server = app.listen(Number(process.env.PORT ?? 3000), () => {
  console.log(`Formulário em http://localhost:${server.address().port}`);
});

async function encerrar() {
  server.close();
  await client.close();
}
process.once('SIGINT', encerrar);
process.once('SIGTERM', encerrar);

import express from 'express';
import { conectar } from './redis.js';
import { FilaRedis } from './fila-redis.js';

const client = await conectar();
const fila = new FilaRedis(client, 'fila:emails');
const app = express();
app.use(express.json());

app.post('/emails', async (req, res, next) => {
  try {
    const { para, assunto } = req.body ?? {};
    if (!para || !assunto) {
      return res.status(400).json({ erro: 'Informe "para" e "assunto".' });
    }

    const id = await fila.enfileirar({ para, assunto });
    return res.status(202).json({ id, status: 'enfileirado' });
  } catch (erro) {
    return next(erro);
  }
});

app.get('/status', async (_req, res, next) => {
  try {
    return res.json(await fila.tamanho());
  } catch (erro) {
    return next(erro);
  }
});

app.use((erro, _req, res, _next) => {
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno ao acessar a fila.' });
});

const server = app.listen(Number(process.env.PORT ?? 3000), () => {
  console.log(`API em http://localhost:${server.address().port}`);
});

async function encerrar() {
  server.close();
  await client.close();
}
process.once('SIGINT', encerrar);
process.once('SIGTERM', encerrar);

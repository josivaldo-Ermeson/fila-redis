import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import { conectar } from './redis.js';
import { K, publicar } from './chaves.js';

const workerId = process.argv[2] ?? 'worker-1';
const MAX_TENTATIVAS = 3;
const ATRASO_MS = Math.max(0, Number(process.env.ATRASO_POR_PAGINA_MS ?? 400));

const client = await conectar();
const bloqueante = await client.duplicate().connect();
const processando = K.processando(workerId);
await mkdir('resultados', { recursive: true });

async function extrairTexto(id, caminho) {
  const parser = new PDFParse({ data: await readFile(caminho) });
  try {
    const { total } = await parser.getInfo();
    await client.hSet(K.job(id), { paginas: total, pagina: 0 });

    const partes = [];
    for (let n = 1; n <= total; n++) {
      const { text } = await parser.getText({ partial: [n] });
      partes.push(text);
      await client.hSet(K.job(id), { pagina: n });
      if (ATRASO_MS) await new Promise((resolve) => setTimeout(resolve, ATRASO_MS));
    }

    const texto = partes.join('\n\n');
    const resultado = `resultados/${id}.txt`;
    await writeFile(resultado, texto, 'utf8');
    return { resultado, caracteres: texto.length };
  } finally {
    await parser.destroy();
  }
}

let rodando = true;
for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, () => {
    console.log(`[${workerId}] encerrando após o job atual...`);
    rodando = false;
  });
}

let preso;
while ((preso = await client.lMove(processando, K.fila, 'RIGHT', 'RIGHT'))) {
  await client.hSet(K.job(preso), { status: 'na_fila' });
  console.log(`[${workerId}] job ${preso} recuperado`);
}

console.log(`[${workerId}] aguardando PDFs...`);
try {
  while (rodando) {
    const id = await bloqueante.blMove(K.fila, processando, 'RIGHT', 'LEFT', 5);
    if (id === null) continue;

    const { nome, caminho } = await client.hGetAll(K.job(id));
    await client.hSet(K.job(id), { status: 'processando', worker: workerId, iniciadoEm: Date.now() });
    await publicar(client, 'iniciado', { id, nome, worker: workerId });
    console.log(`[${workerId}] processando ${nome}`);

    try {
      const { resultado, caracteres } = await extrairTexto(id, caminho);
      await client
        .multi()
        .hSet(K.job(id), { status: 'concluido', resultado, caracteres, concluidoEm: Date.now() })
        .hIncrBy(K.contagem, 'concluidos', 1)
        .lRem(processando, 1, id)
        .exec();
      await publicar(client, 'concluido', { id, nome, caracteres, worker: workerId });
      console.log(`[${workerId}] ${nome}: ${caracteres} caracteres extraídos`);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      const tentativas = await client.hIncrBy(K.job(id), 'tentativas', 1);
      const desistir = tentativas >= MAX_TENTATIVAS;

      await client
        .multi()
        .hSet(K.job(id), { status: desistir ? 'erro' : 'na_fila', erro: mensagem })
        .lRem(processando, 1, id)
        .lPush(desistir ? K.falhas : K.fila, id)
        .hIncrBy(K.contagem, desistir ? 'erros' : 'retentativas', 1)
        .exec();

      await publicar(client, desistir ? 'erro' : 'reenfileirado', {
        id, nome, worker: workerId, tentativas, erro: mensagem,
      });
      console.error(`[${workerId}] ${nome}: falha ${tentativas}/${MAX_TENTATIVAS} (${mensagem})`);
    }
  }
} finally {
  await bloqueante.close();
  await client.close();
}

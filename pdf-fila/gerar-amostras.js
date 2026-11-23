import { mkdir, writeFile } from 'node:fs/promises';

function criarPdf(paginas) {
  const objetos = [];
  const pagetree = [];
  const pageIds = paginas.map((_, i) => 3 + i * 2);
  const fontId = 3 + paginas.length * 2;
  objetos[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objetos[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${paginas.length} >>`;

  paginas.forEach((linhas, i) => {
    const pageId = pageIds[i];
    const streamId = pageId + 1;
    const comandos = ['BT', '/F1 18 Tf', '72 740 Td'];
    for (const [j, linha] of linhas.entries()) {
      if (j) comandos.push('0 -28 Td');
      const segura = linha.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, '?');
      comandos.push(`(${segura}) Tj`);
    }
    comandos.push('ET');
    const stream = comandos.join('\n');
    objetos[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${streamId} 0 R >>`;
    objetos[streamId] = `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`;
    pagetree.push(pageId);
  });
  objetos[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let id = 1; id < objetos.length; id++) {
    offsets[id] = Buffer.byteLength(pdf, 'binary');
    pdf += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf, 'binary');
  pdf += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objetos.length; id++) {
    pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'binary');
}

await mkdir('amostras', { recursive: true });
const amostras = [
  ['edital-pibic.pdf', [['Edital PIBIC', 'Inscricoes abertas para bolsas de pesquisa.']]],
  ['apostila-redis.pdf', [
    ['Apostila Redis', 'Capitulo 1: estruturas de dados.'],
    ['Capitulo 2', 'Listas podem implementar filas FIFO.'],
    ['Capitulo 3', 'Streams oferecem grupos de consumidores.'],
  ]],
  ['relatorio-final.pdf', [['Relatorio final', 'Processamento concluido com sucesso.']]],
];

for (const [nome, paginas] of amostras) {
  await writeFile(`amostras/${nome}`, criarPdf(paginas));
}
await writeFile('amostras/corrompido.pdf', '%PDF-1.4\neste arquivo foi corrompido intencionalmente\n');
console.log('Amostras criadas em amostras/.');

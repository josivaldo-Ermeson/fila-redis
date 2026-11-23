# Fila de extração de PDFs com Redis

Exemplo do capítulo 12 do README principal. A API recebe PDFs e cria jobs; os workers extraem o texto página por página; o monitor mostra a fila, o progresso e os eventos Pub/Sub.

## Requisitos

- Node.js 22 ou superior
- Docker e Redis 6.2 ou superior

## Executar

Na pasta `pdf-fila`:

```bash
npm install
npm run samples
docker run -d --name redis-pdf -p 6379:6379 -v redis-pdf-dados:/data redis:8 redis-server --appendonly yes
npm run api
```

Em três outros terminais:

```bash
npm run worker -- worker-1
npm run worker -- worker-2
npm run monitor
```

Abra http://localhost:3000 e envie PDFs da pasta `amostras/`. Cada arquivo pode ter até 20 MB; são aceitos até 10 por envio. Os resultados ficam em `resultados/`, e o status de cada job pode ser consultado em `GET /pdfs/:id`.

Para pular a pausa didática entre páginas, defina `ATRASO_POR_PAGINA_MS=0`. Para outro Redis, defina `REDIS_URL`.

Quatro PDFs de exemplo já estão em `amostras/`. O gerador `npm run samples` recria três PDFs válidos e o arquivo corrompido.

# Seção 8 — Streams

Inicie dois consumidores, depois publique mensagens. O grupo `cozinha` divide as mensagens entre os workers e `XACK` confirma cada processamento.

```bash
node stream-worker.js worker-1
node stream-worker.js worker-2
node stream-produtor.js
```

O exemplo usa o stream `exemplo:fila:pedidos`. Para consultar as pendências no Redis: `XPENDING exemplo:fila:pedidos cozinha`.

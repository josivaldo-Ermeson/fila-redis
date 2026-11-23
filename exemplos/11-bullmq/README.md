# Seção 11 — BullMQ

Esse exemplo reescreve o produtor/worker de e-mails usando BullMQ. Requer Redis, Node.js e os pacotes já declarados em `../package.json`.

```bash
node bull-fila.js
node bull-worker.js
```

O produtor inclui jobs normais, atrasados e priorizados; o endereço `@invalido.com` falha três vezes e fica consultável no estado `failed`. Para executar outra vez, remova os jobs finalizados ou use outro nome de fila.

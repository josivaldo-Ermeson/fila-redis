# Fila de e-mails com Redis

Exemplo do capítulo 10 do README principal. A API enfileira pedidos; workers simulam o envio, fazem até três tentativas e recuperam tarefas deixadas na lista de processamento após uma queda.

## Requisitos

- Node.js 22 ou superior
- Redis 6.2 ou superior (o exemplo usa `BLMOVE`)

## Executar

Na pasta `filas-redis`:

```bash
npm install
docker run -d --name redis-aula -p 6379:6379 redis:8
npm run api
```

Em outros dois terminais:

```bash
npm run worker -- worker-1
npm run worker -- worker-2
```

A API fica em `http://localhost:3000`. Para enfileirar um e-mail:

```bash
curl -X POST http://localhost:3000/emails \
  -H 'Content-Type: application/json' \
  -d '{"para":"ana@ifpb.edu.br","assunto":"Inscrição confirmada"}'
curl http://localhost:3000/status
```

Endereços terminados em `@invalido.com` simulam falhas permanentes. Após três tentativas, a tarefa vai para `fila:emails:falhas`. Defina `REDIS_URL` para usar outro servidor Redis.

# Exemplos do tutorial

Exemplos executáveis das seções 5 a 9 e 11 do README principal. Os projetos completos das seções 10 e 12 estão em `../filas-redis` e `../pdf-fila`.

## Pastas

- `05-filas-js/`: fila com array, índices e nós; comparação de desempenho.
- `06-redis-lists/`: operações FIFO, bloqueio e confirmação com Lists.
- `07-prioridade-atraso/`: Sorted Set, níveis de prioridade e agendamento.
- `08-streams/`: produtor e consumidor com grupo, pendências e XACK.
- `09-node-redis/`: conexão reutilizável e comandos básicos em JavaScript.
- `11-bullmq/`: o mesmo cenário de e-mails com BullMQ.

## Requisitos e execução

Os exemplos Redis precisam de Node.js 22+ e Redis 6.2+ (Streams e comandos mais novos podem pedir Redis 7+). Na pasta `exemplos/`:

```bash
npm install
docker run -d --name redis-exemplos -p 6379:6379 redis:8
```

Cada pasta tem um README com os comandos para executar. Os scripts usam chaves com prefixo `exemplo:`; para executar novamente, cada demonstração limpa apenas as chaves dela.

Os exemplos de fila em memória da seção 5 não precisam de Redis.

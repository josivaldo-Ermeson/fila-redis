# Seção 6 — Lists como filas

A FIFO pode ser `LPUSH` + `RPOP` ou o espelho `RPUSH` + `LPOP`. O roteiro abaixo cobre inserção, leitura, bloqueio e a lista de processamento. Ele pode ser copiado no `redis-cli`.

```text
LPUSH exemplo:fila a b c
LRANGE exemplo:fila 0 -1
RPUSH exemplo:fila d
RPOP exemplo:fila 2
LPOP exemplo:fila
LPUSH exemplo:emails email-1
LPUSH exemplo:emails email-2
LPUSH exemplo:emails email-3
BRPOP exemplo:emails 0
```

Em outro terminal, acorde o `BRPOP` com `LPUSH exemplo:emails email-4`. Para experimentar a fila confiável:

```text
LPUSH exemplo:confiavel '{"id":1,"para":"ana@ex.com"}'
BLMOVE exemplo:confiavel exemplo:processando RIGHT LEFT 5
LREM exemplo:processando 1 '{"id":1,"para":"ana@ex.com"}'
```

O arquivo `demonstrar.js` executa o equivalente com node-redis. Para testar o bloqueio, mantenha `node consumidor.js` rodando e, em outro terminal, execute `node produtor.js`.

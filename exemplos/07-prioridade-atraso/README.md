# Seção 7 — prioridade e atraso

```bash
node prioridade.js
node agendador.js
```

`prioridade.js` mostra Sorted Set (menor score primeiro) e Lists separadas para preservar FIFO dentro de cada nível. `agendador.js` move tarefas vencidas do Sorted Set para a fila de e-mails. Ambos usam somente as chaves `exemplo:`.

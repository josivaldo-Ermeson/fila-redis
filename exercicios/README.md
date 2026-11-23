# Exercícios propostos

Enunciados transcritos e organizados a partir da seção 14 do README principal. Os exercícios são desafios para resolver; este material não inclui soluções. Os caminhos citados apontam para exemplos e projetos que servem de ponto de partida.

## 1. Fila circular

Implemente uma classe `FilaCircular` com capacidade fixa, usando um array de tamanho N e os índices `inicio` e `fim` com aritmética modular (`(fim + 1) % N`). `enfileirar` deve lançar erro quando a fila estiver cheia. Compare com `exemplos/05-filas-js/fila.js`: qual usa memória de forma mais previsível?

## 2. Fila de atendimento no redis-cli

Enfileire 5 alunos com `LPUSH fila:atendimento`, atenda 2 com `RPOP`, mostre o próximo com `LINDEX` e o tamanho com `LLEN`. Repita usando `RPUSH` + `LPOP`. Depois, troque para `LPUSH` + `LPOP` e explique por que a ordem de atendimento mudou.

## 3. Medindo o paralelismo

Enfileire 100 tarefas no projeto `filas-redis/` e meça o tempo total com 1, 2 e 4 workers. Monte uma tabela e explique por que o ganho não é infinito.

## 4. Agendador atômico com Lua

Reescreva `moverVencidas` de `exemplos/07-prioridade-atraso/agendador.js` para que buscar, remover e enfileirar aconteçam num único script executado com `client.eval(script, { keys: [...], arguments: [String(Date.now())] })`.

Ponto de partida:

```lua
local itens = redis.call('ZRANGE', KEYS[1], '-inf', ARGV[1], 'BYSCORE', 'LIMIT', 0, 100)
for _, item in ipairs(itens) do
  -- remova do Sorted Set (KEYS[1]) e coloque na List (KEYS[2])
end
return #itens
```

## 5. Retentativa com espera exponencial

Na classe `FilaRedis` em `filas-redis/fila-redis.js`, em vez de reenfileirar na hora após uma falha, agende a nova tentativa para daqui a `2^tentativas` segundos (2 s, 4 s, 8 s) usando um Sorted Set como o da seção 7.3.

## 6. Painel da fila de falhas

Acrescente a `filas-redis/api.js` as rotas `GET /falhas` (lista as tarefas da DLQ) e `POST /falhas/reprocessar` (devolve todas para a fila principal com `lMove`, zerando `tentativas`).

## 7. Prioridade x confiabilidade

Faça a API aceitar `prioridade: "alta" | "normal"` e o worker consumir as duas filas com `brPop` (seção 7.2). Você perdeu a lista de processamento: explique o risco e proponha uma solução.

## 8. Dois serviços, um stream

Crie no mesmo stream os grupos `email` e `auditoria`. Mostre que cada grupo recebe todas as mensagens, enquanto os consumidores de um mesmo grupo dividem as mensagens entre si.

## 9. Migração para BullMQ

Reescreva `filas-redis/` com BullMQ, mantendo a API Express e o comportamento (3 tentativas, falhas consultáveis). Compare o número de linhas e liste o que o BullMQ passou a fazer por você. Use `exemplos/11-bullmq/` como referência.

## 10. Progresso ao vivo no navegador

No projeto `pdf-fila/`, crie na `api.js` a rota `GET /eventos`, que assina o canal `pdf:eventos` e repassa cada mensagem ao navegador como Server-Sent Events. Na página, troque o `setInterval` por um `EventSource('/eventos')`. Compare quantas requisições por minuto cada abordagem faz com 10 jobs na tela.

## 11. Retomar de onde parou

No projeto `pdf-fila/`, faça o worker guardar cada página extraída numa List `pdf:paginas:<id>` (`RPUSH`). Numa retentativa ou recuperação, comece da página `LLEN + 1` em vez da primeira. Teste matando o worker no meio da `amostras/apostila-redis.pdf`.

## 12. Cancelar um job

No projeto `pdf-fila/`, crie `DELETE /pdfs/:id`: se o job ainda estiver em `pdf:fila`, remova-o com `LREM` e marque o status como `cancelado`. Explique por que cancelar um job que já está em processamento é mais difícil e proponha uma solução usando o Hash do job.

## Organização dos resultados

Para cada exercício, registre os arquivos alterados, os comandos usados e uma breve resposta às perguntas. Não altere os exemplos base: faça as soluções em cópias ou numa pasta própria para comparar com o comportamento original.

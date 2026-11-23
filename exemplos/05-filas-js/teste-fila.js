import { Fila as FilaIndices } from './fila.js';
import { FilaArray } from './fila-array.js';
import { FilaEncadeada } from './fila-encadeada.js';

for (const Classe of [FilaArray, FilaIndices, FilaEncadeada]) {
  const fila = new Classe();
  fila.enfileirar('Ana');
  fila.enfileirar('Bruno');
  fila.enfileirar('Caio');

  console.log(Classe.name, {
    frente: fila.frente(),
    primeiro: fila.desenfileirar(),
    segundo: fila.desenfileirar(),
    tamanho: fila.tamanho(),
    vazia: fila.estaVazia(),
  });
}

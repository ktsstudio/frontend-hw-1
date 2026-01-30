// @ts-nocheck
import bfs from '../bfs';

describe('Функция bfs', () => {
  it('Граф со связями', () => {
    const graph = {
      A: ['B', 'C'],
      B: ['D', 'E'],
      C: ['F', 'G'],
      D: [],
      E: [],
      F: [],
      G: [],
    };
    const result = bfs(graph);

    expect(result).toStrictEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  it('Граф со связями. Разное кол-во детей', () => {
    const graph = {
      A: ['B', 'C', 'H'],
      B: ['D', 'E'],
      C: ['F', 'G'],
      D: [],
      H: ['M'],
      M: [],
      E: [],
      F: [],
      G: [],
    };
    const result = bfs(graph);

    expect(result).toStrictEqual(['A', 'B', 'C', 'H', 'D', 'E', 'F', 'G', 'M']);
  });

  it('Большой граф', () => {
    const graph = {
      A: ['B', 'C', 'H'],
      B: ['D', 'E'],
      C: ['F', 'G'],
      D: ['J', 'K', 'L'],
      H: ['M'],
      M: ['X'],
      E: [],
      F: [],
      G: ['Z'],
      J: [],
      K: [],
      L: [],
      Z: [],
      X: ['V', 'N'],
      V: [],
      N: [],
    };

    const result = bfs(graph);

    expect(result).toStrictEqual([
      'A',
      'B',
      'C',
      'H',
      'D',
      'E',
      'F',
      'G',
      'M',
      'J',
      'K',
      'L',
      'Z',
      'X',
      'V',
      'N',
    ]);
  });

  it('Граф без связей', () => {
    const graph = {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: [],
      G: [],
    };
    const result = bfs(graph);

    expect(result).toStrictEqual(['A']);
  });

  it('Невалидный аргумент', () => {
    expect(() => bfs('{}')).toThrow(/^INVALID_ARGUMENT$/);
  });
});

// @ts-nocheck
import dfs from '../dfs';

describe('Функция dfs', () => {
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
    const result = dfs(graph);

    expect(result).toStrictEqual(['A', 'B', 'D', 'E', 'C', 'F', 'G']);
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
    const result = dfs(graph);

    expect(result).toStrictEqual(['A', 'B', 'D', 'E', 'C', 'F', 'G', 'H', 'M']);
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

    const result = dfs(graph);

    expect(result).toStrictEqual([
      'A',
      'B',
      'D',
      'J',
      'K',
      'L',
      'E',
      'C',
      'F',
      'G',
      'Z',
      'H',
      'M',
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
    const result = dfs(graph);

    expect(result).toStrictEqual(['A']);
  });

  it('Невалидный аргумент', () => {
    expect(() => dfs('{}')).toThrow(/^INVALID_ARGUMENT$/);
  });
});

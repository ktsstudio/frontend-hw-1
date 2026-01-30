// @ts-nocheck
import patchArrays from '../patchArrays';

describe('Функция patchArrays', () => {
  beforeAll(() => {
    patchArrays();
  });

  afterAll(() => {
    delete Array.prototype.count;
    delete Array.prototype.insert;
    delete Array.prototype.remove;
  });

  it('Метод count. Без аргументов', () => {
    expect([1, 2, 3].count()).toBe(3);
  });

  it('Метод count. Много элементов', () => {
    expect(
      [
        32, 77, 4, 35, 88, 60, 8, 32, 80, 69, 60, 73, 32, 26, 70, 71, 42, 54,
        71, 26,
      ].count()
    ).toBe(20);
  });

  it('Метод count. Пустого массива', () => {
    expect([].count()).toBe(0);
  });

  it('Метод insert. Добавление элемента за пределы массива', () => {
    expect([2, 4].insert(10, 1)).toStrictEqual([2, 4, 1]);
  });

  it('Метод insert. Отрицательный index', () => {
    expect([2, 4].insert(-10, 3)).toStrictEqual([3, 2, 4]);
  });

  it('Метод insert. Добавление элемента в начало массива', () => {
    expect([2, 4].insert(0, 3)).toStrictEqual([3, 2, 4]);
  });

  it('Метод insert. Добавление элемента в середину массива', () => {
    expect([2, 4].insert(1, 3)).toStrictEqual([2, 3, 4]);
  });

  it('Метод insert. Добавление элементов разных типов данных', () => {
    const arr: (number | string)[] = [];
    arr.insert(0, 3);
    arr.insert(1, '5');
    arr.insert(0, '15');
    expect(arr).toStrictEqual(['15', 3, '5']);
  });

  it('Метод insert. Проверка цепочки', () => {
    const arr: (number | string)[] = [];
    arr.insert(0, 3).insert(1, '65').insert(0, '15');
    expect(arr).toStrictEqual(['15', 3, '65']);
  });

  it('Метод insert. Невалидный индекс', () => {
    const arr = [];
    expect(() => arr.insert('0', 3)).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Метод remove. Удаление элемента существующего элемента', () => {
    expect([1, 3, 5, 6].remove(5)).toStrictEqual([1, 3, 6]);
  });

  it('Метод remove. Удаление из пустого массива', () => {
    expect(([] as number[]).remove(5)).toStrictEqual([]);
  });

  it('Метод remove. Удаление ссылочных типов данных', () => {
    const a = { a: 1, b: 2 };
    const b = ['2'];

    expect(['3', a, b].remove(b)).toStrictEqual(['3', a]);
  });

  it('Метод remove. Несколько одинаковых элементов. Удалился первый', () => {
    const arr = [null, 1, null, 'name'];
    arr.remove(null);
    expect(arr).toStrictEqual([1, null, 'name']);
  });

  it('Метод remove. Удаление в цепочке', () => {
    const arr = [null, 1, null, 'name'];
    arr.remove(null);
    expect(arr).toStrictEqual([1, null, 'name']);
    arr.remove(null).remove('name');
    expect(arr).toStrictEqual([1]);
  });

  it('Все методы по цепочке', () => {
    const arr = [1, 3];
    arr.insert(0, 10).remove(3).insert(2, 5);
    expect(arr).toStrictEqual([10, 1, 5]);
  });
});

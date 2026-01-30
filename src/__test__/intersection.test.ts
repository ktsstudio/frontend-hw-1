// @ts-nocheck
import intersection from '../intersection';

describe('Функция Intersection', () => {
  it('Два массива чисел. Пересечений нет', () => {
    expect(intersection([1], [2])).toStrictEqual([]);
  });

  it('Два массива чисел. Есть пересечения', () => {
    const result = intersection([1, 6, 3], [6, 4, 5, 3, 6]);
    expect(result.sort()).toStrictEqual([3, 6]);
  });

  it('Два одинаковых массива чисел. Есть пересечения', () => {
    expect(intersection([1, 1], [1, 1])).toStrictEqual([1]);
  });

  it('Два пустых массива.', () => {
    expect(intersection([], [])).toStrictEqual([]);
  });

  it('Первый аргумент не массив. Второй массив', () => {
    expect(() => intersection('[]', [])).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Второй аргумент не массив. Первый массив', () => {
    expect(() => intersection([], '[]')).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Оба аргумента не массивы', () => {
    expect(() => intersection({}, '1')).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('В первом массиве есть не только цифры', () => {
    expect(() => intersection(['1', 2], [2, 3])).toThrow(
      /^INVALID_ELEMENT_IN_ARRAY$/
    );
  });

  it('Во втором массиве есть не только цифры', () => {
    expect(() => intersection([1, 2], ['1', 2, 3])).toThrow(
      /^INVALID_ELEMENT_IN_ARRAY$/
    );
  });

  it('Несколько одинаковых элементов в массиве', () => {
    expect(intersection([1, 2, 1], [1])).toStrictEqual([1]);
  });

  it('Без аргументов', () => {
    expect(() => intersection()).toThrow(/^INVALID_ARGUMENTS_COUNT$/);
  });

  it('Один аргумент', () => {
    expect(() => intersection([3, 2])).toThrow(/^INVALID_ARGUMENTS_COUNT$/);
  });
});

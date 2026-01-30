// @ts-nocheck
import getNumberProps from '../getNumberProps';

describe('Функция getNumberProps', () => {
  it('Переданный аргумент - строка', () => {
    expect(() => getNumberProps('{}')).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Переданный аргумент - массив', () => {
    expect(() => getNumberProps([])).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Переданный аргумент - null', () => {
    expect(() => getNumberProps(null)).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Пустой объект', () => {
    expect(getNumberProps({})).toStrictEqual([]);
  });

  it('Один уровней вложенности', () => {
    expect(
      getNumberProps({
        a: 1,
        c: 15,
      })
    ).toStrictEqual(['a', 'c']);
  });

  it('Несколько уровней вложенности', () => {
    expect(
      getNumberProps({
        a: 1,
        c: 1,
        b: { c: 2, d: 1, e: '1' },
        m: 3,
      })
    ).toStrictEqual(['a', 'c', 'c', 'd', 'm']);
  });

  it('Несколько уровней вложенности, на третьем уровне нет численных свойств', () => {
    expect(
      getNumberProps({
        a: 1,
        c: 1,
        b: {
          c: 2,
          d: {
            a: 'a',
            b: 'b',
          },
          e: '1',
        },
        m: 3,
      })
    ).toStrictEqual(['a', 'c', 'c', 'm']);
  });

  it('Несколько уровней вложенности, на первом есть, на втором нет, на третьем есть', () => {
    expect(
      getNumberProps({
        a: 1,
        c: 1,
        h: {
          c: 'h',
          d: {
            a: 2,
            b: 'b',
          },
          e: '1',
        },
        m: 3,
      })
    ).toStrictEqual(['a', 'a', 'c', 'm']);
  });
});

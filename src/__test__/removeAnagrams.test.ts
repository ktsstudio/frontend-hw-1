// @ts-nocheck
import removeAnagrams from '../removeAnagrams';

describe('Функция removeAnagrams', () => {
  it('Три слова, есть анаграммы', () => {
    expect(removeAnagrams(['cat', 'act', 'arc'])).toStrictEqual(['arc']);
  });

  it('Есть только анаграммы', () => {
    expect(removeAnagrams(['car', 'arc'])).toStrictEqual([]);
  });

  it('Пустой массив', () => {
    expect(removeAnagrams([])).toStrictEqual([]);
  });

  it('Без аргументов', () => {
    expect(() => removeAnagrams()).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Аргумент не массив', () => {
    expect(() => removeAnagrams(undefined)).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Массив c числами', () => {
    expect(() => removeAnagrams(['cat', ['act'], 2])).toThrow(
      /^INVALID_ELEMENT_IN_ARRAY$/
    );
  });

  it('Только анаграммы', () => {
    expect(
      removeAnagrams(['nap', 'pan', 'teachers', 'cheaters'])
    ).toStrictEqual([]);
  });

  it('Нет анаграммы, порядок слов остался тем же', () => {
    expect(removeAnagrams(['nap', 'pa', 'teacher', 'cheaters'])).toStrictEqual([
      'nap',
      'pa',
      'teacher',
      'cheaters',
    ]);
  });

  it('Несколько анаграмм', () => {
    expect(
      removeAnagrams(['nap', 'pan', 'teachers', 'cheaters', 'apn', 'cat'])
    ).toStrictEqual(['cat']);
  });

  it('Большой массив', () => {
    expect(
      removeAnagrams([
        'Lorem',
        'ipsum',
        'dolor',
        'sit',
        'amet,',
        'consectetur',
        'adipiscing',
        'elit,',
        'sed',
        'do',
        'eiusmod',
        'tempor',
        'incididunt',
        'labore',
        'et',
        'dolore',
        'magna',
        'aliqua.',
        'enim',
        'ad',
        'minim',
        'veniam,',
        'quis',
        'nostrud',
        'exercitation',
        'ullamco',
        'laboris',
        'nisi',
        'aliquip',
        'ex',
        'ea',
        'commodo',
        'consequat.',
      ])
    ).toStrictEqual([
      'Lorem',
      'ipsum',
      'dolor',
      'sit',
      'amet,',
      'consectetur',
      'adipiscing',
      'elit,',
      'sed',
      'do',
      'eiusmod',
      'tempor',
      'incididunt',
      'labore',
      'et',
      'dolore',
      'magna',
      'aliqua.',
      'enim',
      'ad',
      'minim',
      'veniam,',
      'quis',
      'nostrud',
      'exercitation',
      'ullamco',
      'laboris',
      'nisi',
      'aliquip',
      'ex',
      'ea',
      'commodo',
      'consequat.',
    ]);
  });
});

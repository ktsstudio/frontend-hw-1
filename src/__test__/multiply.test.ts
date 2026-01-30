// @ts-nocheck
import multiply from '../multiply';

describe('Функция multiply', () => {
  it('Множитель 10', () => {
    expect(multiply(10)(3)).toBe(30);
  });

  it('Множитель 2', () => {
    expect(multiply(2)(6)).toBe(12);
  });

  it('Множитель 0', () => {
    expect(multiply(0)(6)).toBe(0);
  });

  it('Аргумент 0', () => {
    expect(multiply(3)(0)).toBe(0);
  });

  it('Невалидный множитель', () => {
    expect(() => multiply('3')).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Невалидный аргумент', () => {
    expect(() => multiply(2)('3')).toThrow(/^INVALID_ARGUMENT$/);
  });
});

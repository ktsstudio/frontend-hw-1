// @ts-nocheck
import planEvent from '../planEvent';

jest.useFakeTimers();

describe('Функция planEvent', () => {
  it('Функция вызвана через 3000 секунд и вернулся верный результат', () => {
    const value = 'Done';
    const cb = jest.fn(() => value);

    const promise = planEvent(cb, 3000);

    expect(cb).not.toHaveBeenCalled();

    jest.advanceTimersByTime(3000);

    expect(cb).toHaveBeenCalledTimes(1);
    expect(promise).resolves.toBe(value);
  });

  it('Проверка на ссылочные значения', () => {
    const value = { status: 'ok' };
    const cb = jest.fn(() => value);

    const promise = planEvent(cb, 1000);

    jest.advanceTimersByTime(1000);

    expect(promise).resolves.toBe(value);
  });

  it('Функция вызвана сразу и вернулся верный результат', () => {
    const value = 'Done';
    const cb = jest.fn(() => value);

    const promise = planEvent(cb, -10);
    jest.advanceTimersByTime(0);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(promise).resolves.toBe(value);
  });

  it('Первый аргумент невалиден', () => {
    expect(() => planEvent('2', 100)).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Второй аргумент невалиден', () => {
    expect(() => planEvent(() => 'Done', '100')).toThrow(/^INVALID_ARGUMENT$/);
  });
});

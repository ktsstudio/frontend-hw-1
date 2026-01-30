import memo from '../memo';

jest.useFakeTimers();

const range = (n: number) => Array.from(Array(n).keys());

const echoOneArgument = (arg: number) => arg;
const echoArguments = (...args: number[]) => args;

/**
 * 1. Нет аргументов
 * 1.1. Время мемоизации: 1000 мс +
 * 1.2. Время мемоизации неограничено +
 *
 * 2. Один аргумент:
 * 2.1. Время мемоизации: 1000 мс +
 * 2.2. Время мемоизации неограничено +
 *
 * 3. Три аргумента:
 * 2.1. Время мемоизации: 1000 мс +
 * 2.2. Время мемоизации неограничено +
 *
 * 4. Три аргумента, в том числе ссылки, мемоизация на 1500 мс +
 * 5. Три одинаковых аргумента в разном порядке, в том числе ссылки, мемоизация на 2000 мс +
 * 6. Много вызовов с множеством аргументов, мемоизация на 1000 мс +
 *
 * 7. Неверные аргументы:
 * 7.1. Первый аргумент не функция +
 * 7.2. Второй аргумент не число или число меньше нуля +
 */

describe('Функция memo', () => {
  it('Нет аргументов. Время мемоизации: 1000 мс', () => {
    const returnValue = 'Some value';

    const original = jest.fn(() => returnValue);
    const memoized = memo(original, 1000);

    // Первый вызов вызывает оригинальную функцию
    expect(memoized()).toEqual(returnValue);
    expect(original).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(500);

    // Вызов до истечения мемоизации не вызывает оригинальную функцию
    expect(memoized()).toEqual(returnValue);
    expect(original).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(500);

    // Вызов до истечения обновлённого времени мемоизации
    // не вызывает оригинальную функцию
    expect(memoized()).toEqual(returnValue);
    expect(original).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    // Вызов после истечения мемоизации вызывает оригинальную функцию
    expect(memoized()).toEqual(returnValue);
    expect(original).toHaveBeenCalledTimes(2);
  });

  it('Нет аргументов. Время мемоизации неограничено', () => {
    const returnValue = 'Some value';
    const timesToCall = 3;

    const original = jest.fn(() => returnValue);
    const memoized = memo(original);

    range(timesToCall).forEach(() => {
      expect(memoized()).toEqual(returnValue);
    });

    expect(original).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(10000);

    range(timesToCall).forEach(() => {
      expect(memoized()).toEqual(returnValue);
    });

    expect(original).toHaveBeenCalledTimes(1);
  });

  it('Один аргумент. Время мемоизации: 1000 мс', () => {
    const firstArgs = [1] as const;
    const secondArgs = [2] as const;

    const original = jest.fn();
    original.mockImplementation(echoOneArgument);

    const memoized = memo(original, 1000);

    // Первый вызов
    expect(memoized(...firstArgs)).toEqual(firstArgs[0]);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов до истечения мемоизации
    jest.advanceTimersByTime(500);
    expect(memoized(...firstArgs)).toEqual(firstArgs[0]);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов до истечения обновлённой мемоизации
    jest.advanceTimersByTime(500);
    expect(memoized(...firstArgs)).toEqual(firstArgs[0]);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов после истечения мемоизации
    jest.advanceTimersByTime(1000);
    expect(memoized(...firstArgs)).toEqual(firstArgs[0]);
    expect(original).toHaveBeenCalledTimes(2);

    // Новые аргументы
    expect(memoized(...secondArgs)).toEqual(secondArgs[0]);
    expect(original).toHaveBeenCalledTimes(3);
  });

  it('Один аргумент. Время мемоизации неограничено', () => {
    const firstArgs = [1] as const;
    const secondArgs = [2] as const;
    const timesToCall = 3;

    const original = jest.fn();
    original.mockImplementation(echoOneArgument);

    const memoized = memo(original);

    range(timesToCall).forEach(() => {
      expect(memoized(...firstArgs)).toEqual(firstArgs[0]);
    });

    expect(original).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    range(timesToCall).forEach(() => {
      expect(memoized(...firstArgs)).toEqual(firstArgs[0]);
    });

    expect(original).toHaveBeenCalledTimes(1);

    range(timesToCall).forEach(() => {
      expect(memoized(...secondArgs)).toEqual(secondArgs[0]);
    });

    expect(original).toHaveBeenCalledTimes(2);
  });

  it('Три аргумента. Время мемоизации: 1000 мс', () => {
    const firstArgs = [1, 2, 3] as const;
    const secondArgs = [2, 3, 4] as const;

    const original = jest.fn();
    original.mockImplementation(echoArguments);

    const memoized = memo(original, 1000);

    // Первый вызов
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов до истечения мемоизации
    jest.advanceTimersByTime(500);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов до истечения обновлённой мемоизации
    jest.advanceTimersByTime(500);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов после истечения мемоизации
    jest.advanceTimersByTime(1000);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(2);

    // Новые аргументы
    expect(memoized(...secondArgs)).toEqual(secondArgs);
    expect(original).toHaveBeenCalledTimes(3);
  });

  it('Три аргумента. Время мемоизации неограничено', () => {
    const firstArgs = [1, 2, 3] as const;
    const secondArgs = [2, 3, 4] as const;
    const timesToCall = 3;

    const original = jest.fn();
    original.mockImplementation(echoArguments);

    const memoized = memo(original);

    range(timesToCall).forEach(() => {
      expect(memoized(...firstArgs)).toEqual(firstArgs);
    });

    expect(original).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    range(timesToCall).forEach(() => {
      expect(memoized(...firstArgs)).toEqual(firstArgs);
    });

    expect(original).toHaveBeenCalledTimes(1);

    range(timesToCall).forEach(() => {
      expect(memoized(...secondArgs)).toEqual(secondArgs);
    });

    expect(original).toHaveBeenCalledTimes(2);
  });

  it('Три аргумента, в том числе ссылки. Время мемоизации: 1500 мс', () => {
    const func = () => {};
    const obj = { a: 'Hello' };

    const firstArgs = [1, func, obj] as const;
    const secondArgs = [func, 3, obj] as const;

    const original = jest.fn();
    original.mockImplementation(echoArguments);

    const memoized = memo(original, 1500);

    // Первый вызов
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов до истечения мемоизации
    jest.advanceTimersByTime(1000);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов до истечения обновлённой мемоизации
    jest.advanceTimersByTime(500);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов после истечения мемоизации
    jest.advanceTimersByTime(1500);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(2);

    // Новые аргументы
    expect(memoized(...secondArgs)).toEqual(secondArgs);
    expect(original).toHaveBeenCalledTimes(3);
  });

  it('Три аргумента, в том числе ссылки. Время мемоизации: 2000 мс', () => {
    const func = () => {};
    const obj = { a: 'Hello' };

    const firstArgs = [1, func, obj] as const;
    const secondArgs = [func, 1, obj] as const;

    const original = jest.fn();
    original.mockImplementation(echoArguments);

    const memoized = memo(original, 2000);

    // Первый вызов
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов до истечения мемоизации
    jest.advanceTimersByTime(1000);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов до истечения обновлённой мемоизации
    jest.advanceTimersByTime(500);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(1);

    // Вызов после истечения мемоизации
    jest.advanceTimersByTime(2000);
    expect(memoized(...firstArgs)).toEqual(firstArgs);
    expect(original).toHaveBeenCalledTimes(2);

    // Новые аргументы
    expect(memoized(...secondArgs)).toEqual(secondArgs);
    expect(original).toHaveBeenCalledTimes(3);
  });

  it('Много вызовов с множеством аргументов. Время мемоизации: 2000 мс', () => {
    let idToIncrement = 1;
    const firstArgsSet = range(100).map(() =>
      range(100).map(() => idToIncrement++)
    );
    const secondArgsSet = range(100).map(() =>
      range(100).map(() => idToIncrement++)
    );

    const original = jest.fn();
    original.mockImplementation(echoArguments);

    const memoized = memo(original, 2000);

    // Первый вызов
    firstArgsSet.forEach((args) => {
      expect(memoized(...args)).toEqual(args);
    });
    expect(original).toHaveBeenCalledTimes(100);

    // Вызов до истечения мемоизации
    jest.advanceTimersByTime(1000);
    firstArgsSet.forEach((args) => {
      expect(memoized(...args)).toEqual(args);
    });
    expect(original).toHaveBeenCalledTimes(100);

    // Вызов до истечения обновлённой мемоизации
    jest.advanceTimersByTime(500);
    firstArgsSet.forEach((args) => {
      expect(memoized(...args)).toEqual(args);
    });
    expect(original).toHaveBeenCalledTimes(100);

    // Вызов после истечения мемоизации
    jest.advanceTimersByTime(2000);
    firstArgsSet.forEach((args) => {
      expect(memoized(...args)).toEqual(args);
    });
    expect(original).toHaveBeenCalledTimes(200);

    // Новые аргументы
    secondArgsSet.forEach((args) => {
      expect(memoized(...args)).toEqual(args);
    });
    expect(original).toHaveBeenCalledTimes(300);
  });

  it('Первый аргумент не функция', () => {
    // @ts-ignore
    expect(() => memo(123)).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Второй аргумент не число', () => {
    // @ts-ignore
    expect(() => memo(() => 1, 'a')).toThrow(/^INVALID_ARGUMENT$/);
  });

  it('Второй аргумент число, меньше нуля', () => {
    expect(() => memo(() => 1, -1)).toThrow(/^INVALID_ARGUMENT$/);
  });
});

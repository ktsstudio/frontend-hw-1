import promiseFrame from '../promiseFrame';

// Сделать массив значений от start до end
const boundRange = (start, end): number[] =>
  new Array(end - start).fill(null).map((d, i) => i + start);

// Случайное число от min до max не включая max
const randomInRange = (min, max): number =>
  Math.floor(Math.random() * (max - min)) + min;

const getAsyncFunctions = (
  info: { result: any; time: number; rejectText?: string }[]
): jest.Mock<Promise<any>>[] =>
  info.map(({ result, time, rejectText }) =>
    jest.fn(
      () =>
        new Promise((r, rej) =>
          setTimeout(() => (rejectText ? rej(rejectText) : r(result)), time)
        )
    )
  );

const getSyncFunctions = (
  info: { result: any; throwText?: string }[]
): jest.Mock<any>[] =>
  info.map(({ result, throwText }) =>
    jest.fn(() => {
      if (throwText) {
        throw throwText;
      }

      return result;
    })
  );

/**
 * 1. Одна асинхронная функция:
 * 1.1. Ограничений в выполнении нет:
 * 1.1.1. Промис удовлетворяется +
 * 1.1.2. Промис отклоняется в конце своего выполнения +
 * 1.2. Ограничение на один промис одновременно:
 * 1.2.1. Промис удовлетворяется +
 * 1.2.2. Промис отклоняется в конце своего выполнения +
 * 1.2. Ограничение в два промиса одновременно:
 * 1.2.1. Промис удовлетворяется +
 * 1.2.2. Промис отклоняется в конце своего выполнения +
 * 1.2. Ограничение в три промиса одновременно:
 * 1.2.1. Промис удовлетворяется +
 * 1.2.2. Промис отклоняется в конце своего выполнения +
 * ---------------------------
 * 2. Несколько асинхронных функций:
 * 2.1.1. Ограничений нет:
 * 2.1.1.1. Все промисы удовлетворяются +
 * 2.1.1.2. Один промис отклоняется в конце своего выполнения +
 * 2.1.1.3. Несколько промисов отклоняются в конце своего выполнения +
 * 2.1.1.4. Все промисы отклоняются +
 *
 * 2.1.2. Ограничение в один промис одновременно:
 * 2.1.2.1. Все промисы удовлетворяются +
 * 2.1.2.2. Один промис отклоняется в конце своего выполнения +
 * 2.1.2.3. Несколько промисов отклоняются в конце своего выполнения +
 * 2.1.2.4. Все промисы отклоняются +
 *
 * 2.1.3. Ограничение в два промиса одновременно:
 * 2.1.2.1. Все промисы удовлетворяются +
 * 2.1.2.2. Один промис отклоняется в конце своего выполнения +
 * 2.1.2.3. Несколько промисов отклоняются в конце своего выполнения +
 * 2.1.2.4. Все промисы отклоняются +
 *
 * 2.1.4. Ограничение в равное количество промисов одновременно:
 * 2.1.2.1. Все промисы удовлетворяются +
 * 2.1.2.2. Один промис отклоняется в конце своего выполнения +
 * 2.1.2.3. Несколько промисов отклоняются в конце своего выполнения +
 * 2.1.2.4. Все промисы отклоняются +
 *
 * 2.1.4. Ограничение в большее количество промисов одновременно:
 * 2.1.2.1. Все промисы удовлетворяются +
 * 2.1.2.2. Один промис отклоняется в конце своего выполнения +
 * 2.1.2.3. Несколько промисов отклоняются в конце своего выполнения +
 * 2.1.2.4. Все промисы отклоняются +
 *
 * 2.2. Результаты разных типов:
 * 2.2.1. Ограничений нет:
 * 2.2.1.1. Все промисы удовлетворяются +
 * ---------------------------------
 * 3. Асинхронные и синхронные функции
 * 3.1. Результаты выполнения одного типа:
 * 3.1.1. Ограничений нет:
 * 3.1.1.1. Все функции выполняются +
 * 3.1.1.2. Один промис отклоняется в конце своего выполнения +
 * 3.1.1.3. Одна синхронная функция выкидывает ошибку +
 *
 * 3.1.2. Ограничение в один промис одновременно:
 * 3.1.2.1. Все функции выполняются +
 * 3.1.2.2. Один промис отклоняется в конце своего выполнения +
 * 3.1.2.3. Одна синхронная функция выкидывает ошибку +
 * ---------------------------------
 * 4. Все функции синхронные
 * 4.1. Результаты выполнения одного типа:
 * 4.1.1. Ограничений нет:
 * 4.1.1.1. Все функции выполняются +
 * ---------------------------------
 * 5. Неверные аргументы
 * 5.1. Первый аргумент не массив +
 * 5.2. Второй аргумент не число или число не больше нуля +
 *
 * ---------------------------------
 * 6. Race condition, много асинхронных функций, промисы удовлетворяются:
 * 6.1. Время выполнения каждой функции одинаковое:
 * 6.1.1. Ограничений нет +
 * 6.1.2. Ограничение в два промиса одновременно +
 * 6.1.3. Ограничение в три промиса одновременно +
 *
 * 6.2. Время выполнения каждой функции разное:
 * 6.2.1. Ограничений нет +
 * 6.2.2. Ограничение в два промиса одновременно +
 * 6.2.3. Ограничение в три промиса одновременно +
 *
 * ---------------------------------
 * 7. В момент времени выполняется не более:
 * 7.1. Одного промиса +
 * 7.2. Двух промисов +
 * 7.3. Трёх промисов +
 * 7.4. Четырёх промиса +
 */

describe('Функция promiseFrame', () => {
  it(
    'Одна асинхронная функция. ' +
      'Ограничений в выполнении нет. ' +
      'Промис удовлетворяется',
    async () => {
      jest.useFakeTimers();

      const oneAsyncFuncArray = getAsyncFunctions([{ result: 1, time: 100 }]);

      const result = promiseFrame(oneAsyncFuncArray);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1]);
    }
  );

  it(
    'Одна асинхронная функция. ' +
      'Ограничений в выполнении нет. ' +
      'Промис отклоняется',
    async () => {
      jest.useFakeTimers();

      const oneAsyncFuncArray = getAsyncFunctions([
        {
          result: 1,
          time: 100,
          rejectText: 'Fake error',
        },
      ]);

      const result = promiseFrame(oneAsyncFuncArray);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Одна асинхронная функция. ' +
      'Ограничение в один промис одновременно. ' +
      'Промис удовлетворяется',
    async () => {
      jest.useFakeTimers();

      const oneAsyncFuncArray = getAsyncFunctions([{ result: 1, time: 100 }]);

      const result = promiseFrame(oneAsyncFuncArray, 1);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1]);
    }
  );

  it(
    'Одна асинхронная функция. ' +
      'Ограничение в один промис одновременно. ' +
      'Промис отклоняется',
    async () => {
      jest.useFakeTimers();

      const oneAsyncFuncArray = getAsyncFunctions([
        { result: 1, time: 100, rejectText: 'Fake error' },
      ]);

      const result = promiseFrame(oneAsyncFuncArray, 1);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Одна асинхронная функция. ' +
      'Ограничение в два промиса одновременно. ' +
      'Промис удовлетворяется',
    async () => {
      jest.useFakeTimers();

      const oneAsyncFuncArray = getAsyncFunctions([{ result: 1, time: 100 }]);

      const result = promiseFrame(oneAsyncFuncArray, 2);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1]);
    }
  );

  it(
    'Одна асинхронная функция. ' +
      'Ограничение в два промиса одновременно. ' +
      'Промис отклоняется',
    async () => {
      jest.useFakeTimers();

      const oneAsyncFuncArray = getAsyncFunctions([
        {
          result: 1,
          time: 100,
          rejectText: 'Fake error',
        },
      ]);

      const result = promiseFrame(oneAsyncFuncArray, 2);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Одна асинхронная функция. ' +
      'Ограничение в три промиса одновременно. ' +
      'Промис удовлетворяется',
    async () => {
      jest.useFakeTimers();

      const oneAsyncFuncArray = getAsyncFunctions([{ result: 1, time: 100 }]);

      const result = promiseFrame(oneAsyncFuncArray, 3);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1]);
    }
  );

  it(
    'Одна асинхронная функция. ' +
      'Ограничение в три промиса одновременно. ' +
      'Промис отклоняется',
    async () => {
      jest.useFakeTimers();

      const oneAsyncFuncArray = getAsyncFunctions([
        {
          result: 1,
          time: 100,
          rejectText: 'Fake error',
        },
      ]);

      const result = promiseFrame(oneAsyncFuncArray, 3);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничений нет. ' +
      'Все промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200 },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray);

      jest.advanceTimersByTime(300);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1, 2, 3, 4, 5]);
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничений нет. ' +
      'Один промис отклоняется в конце выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200, rejectText: 'Fake error' },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray);

      jest.advanceTimersByTime(200);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничений нет. ' +
      'Несколько промисов отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200, rejectText: 'Fake error thrown after 200ms' },
        { result: 4, time: 300 },
        { result: 5, time: 100, rejectText: 'Fake error thrown after 100ms' },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error thrown after 100ms');
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничений нет. ' +
      'Все промисы отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100, rejectText: 'Fake error thrown after 100ms' },
        { result: 2, time: 200, rejectText: 'Fake error thrown after 200ms' },
        { result: 3, time: 300, rejectText: 'Fake error thrown after 300ms' },
        { result: 4, time: 400, rejectText: 'Fake error thrown after 400ms' },
        { result: 5, time: 500, rejectText: 'Fake error thrown after 500ms' },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error thrown after 100ms');
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в один промис одновременно. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const times = [100, 200, 200, 300, 100];

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: times[0] },
        { result: 2, time: times[1] },
        { result: 3, time: times[2] },
        { result: 4, time: times[3] },
        { result: 5, time: times[4] },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 1);

      for (let i = 0; i < times.length; i++) {
        jest.advanceTimersByTime(times[i]);
        await Promise.resolve();
      }

      await expect(result).resolves.toEqual([1, 2, 3, 4, 5]);
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в один промис одновременно. ' +
      'Один из промисов отклоняется в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200, rejectText: 'Fake error' },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 1);

      jest.advanceTimersByTime(100);
      await Promise.resolve();
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      jest.advanceTimersByTime(200);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в один промис одновременно. ' +
      'Несколько промисов отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        {
          result: 3,
          time: 200,
          rejectText:
            'Fake error thrown after serial resolving two another promises and after 200ms of its execution',
        },
        { result: 4, time: 300 },
        {
          result: 5,
          time: 100,
          rejectText: 'Fake error, but it should not be thrown',
        },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 1);

      jest.advanceTimersByTime(100);
      await Promise.resolve();
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      jest.advanceTimersByTime(200);
      await Promise.resolve();

      await expect(result).rejects.toEqual(
        'Fake error thrown after serial resolving two another promises and after 200ms of its execution'
      );
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в один промис одновременно. ' +
      'Все промисы отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        {
          result: 1,
          time: 100,
          rejectText:
            'Fake error thrown by the first promise after 100ms of execution',
        },
        { result: 2, time: 200, rejectText: 'Fake error thrown after 200ms' },
        { result: 3, time: 300, rejectText: 'Fake error thrown after 300ms' },
        { result: 4, time: 400, rejectText: 'Fake error thrown after 400ms' },
        { result: 5, time: 500, rejectText: 'Fake error thrown after 500ms' },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 1);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual(
        'Fake error thrown by the first promise after 100ms of execution'
      );
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в два промиса одновременно. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200 },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      // В какой момент какая функция выполняется:
      // 000мс 100мс 200мс 300мс 400мс 500мс
      // 1     1->3  3     3->5  5->|
      // 2     2     2->4  4     4     4->|
      // Для выполнения теста достаточно 500мс
      const result = promiseFrame(severalAsyncFuncsArray, 2);

      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      }

      await expect(result).resolves.toEqual([1, 2, 3, 4, 5]);
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в два промиса одновременно. ' +
      'Один из промисов отклоняется в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200, rejectText: 'Fake error' },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      // В какой момент какая функция выполняется:
      // 000мс 100мс 200мс 300мс 400мс 500мс
      // 1     1->3  3     3->REJECT
      // 2     2     2->4  4     4     4->x
      // Для выполнения теста достаточно 300мс
      const result = promiseFrame(severalAsyncFuncsArray, 2);

      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      }

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в два промиса одновременно. ' +
      'Несколько промисов отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        {
          result: 3,
          time: 200,
          rejectText:
            'Fake error thrown after parallel execution two another promises and after 200ms of its execution',
        },
        { result: 4, time: 300 },
        {
          result: 5,
          time: 100,
          rejectText: 'Fake error, but it should not be thrown',
        },
      ]);

      // В какой момент какая функция выполняется:
      // 000мс 100мс 200мс 300мс 400мс 500мс
      // 1     1->3  3     3->REJECT
      // 2     2     2->4  4     4     4->x
      // Для выполнения теста достаточно 300мс
      const result = promiseFrame(severalAsyncFuncsArray, 2);

      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      }

      await expect(result).rejects.toEqual(
        'Fake error thrown after parallel execution two another promises and after 200ms of its execution'
      );
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в два промиса одновременно. ' +
      'Все промисы отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        {
          result: 1,
          time: 100,
          rejectText:
            'Fake error thrown by the first promise after 100ms of execution',
        },
        { result: 2, time: 200, rejectText: 'Fake error thrown after 200ms' },
        { result: 3, time: 300, rejectText: 'Fake error thrown after 300ms' },
        { result: 4, time: 400, rejectText: 'Fake error thrown after 400ms' },
        { result: 5, time: 500, rejectText: 'Fake error thrown after 500ms' },
      ]);

      // В какой момент какая функция выполняется:
      // 000мс 100мс 200мс 300мс 400мс 500мс
      // 1     1->REJECT
      // 2     2     2->REJECT
      // Для выполнения теста достаточно 100мс
      const result = promiseFrame(severalAsyncFuncsArray, 2);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual(
        'Fake error thrown by the first promise after 100ms of execution'
      );
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в равное количество промисов одновременно. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200 },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 5);

      jest.advanceTimersByTime(300);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1, 2, 3, 4, 5]);
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в равное количество промисов одновременно. ' +
      'Один из промисов отклоняется в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200, rejectText: 'Fake error' },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 5);

      jest.advanceTimersByTime(200);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в равное количество промисов одновременно. ' +
      'Несколько промисов отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        {
          result: 3,
          time: 200,
          rejectText: 'Fake error, but it should not be thrown',
        },
        { result: 4, time: 300 },
        {
          result: 5,
          time: 100,
          rejectText: 'Fake error thrown faster than another potential one',
        },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 5);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual(
        'Fake error thrown faster than another potential one'
      );
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в равное количество промисов одновременно. ' +
      'Все промисы отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        {
          result: 1,
          time: 100,
          rejectText:
            'Fake error thrown by the first promise after 100ms of execution',
        },
        { result: 2, time: 200, rejectText: 'Fake error thrown after 200ms' },
        { result: 3, time: 300, rejectText: 'Fake error thrown after 300ms' },
        { result: 4, time: 400, rejectText: 'Fake error thrown after 400ms' },
        { result: 5, time: 500, rejectText: 'Fake error thrown after 500ms' },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 5);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual(
        'Fake error thrown by the first promise after 100ms of execution'
      );
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в большее количество промисов одновременно. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200 },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 10);

      jest.advanceTimersByTime(300);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1, 2, 3, 4, 5]);
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в большее количество промисов одновременно. ' +
      'Один из промисов отклоняется в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200, rejectText: 'Fake error' },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 10);

      jest.advanceTimersByTime(200);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в большее количество промисов одновременно. ' +
      'Несколько промисов отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        {
          result: 3,
          time: 200,
          rejectText: 'Fake error, but it should not be thrown',
        },
        { result: 4, time: 300 },
        {
          result: 5,
          time: 100,
          rejectText: 'Fake error thrown faster than another potential one',
        },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 10);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual(
        'Fake error thrown faster than another potential one'
      );
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения одного типа. ' +
      'Ограничение в большее количество промисов одновременно. ' +
      'Все промисы отклоняются в конце своего выполнения',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        {
          result: 1,
          time: 100,
          rejectText:
            'Fake error thrown by the first promise after 100ms of execution',
        },
        { result: 2, time: 200, rejectText: 'Fake error thrown after 200ms' },
        { result: 3, time: 300, rejectText: 'Fake error thrown after 300ms' },
        { result: 4, time: 400, rejectText: 'Fake error thrown after 400ms' },
        { result: 5, time: 500, rejectText: 'Fake error thrown after 500ms' },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray, 10);

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      await expect(result).rejects.toEqual(
        'Fake error thrown by the first promise after 100ms of execution'
      );
    }
  );

  it(
    'Несколько асинхронных функций. ' +
      'Результаты выполнения разного типа. ' +
      'Ограничений нет. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const foo = () => {};

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 'a', time: 200 },
        { result: { field: 2 }, time: 200 },
        { result: foo, time: 300 },
      ]);

      const result = promiseFrame(severalAsyncFuncsArray);

      jest.advanceTimersByTime(300);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1, 'a', { field: 2 }, foo]);
    }
  );

  it(
    'Асинхронные и синхронные функции. ' +
      'Ограничений нет. ' +
      'Все функции выполняются',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200 },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const severalSyncFuncsArray = getSyncFunctions([
        { result: 6 },
        { result: 7 },
        { result: 8 },
      ]);

      const result = promiseFrame([
        ...severalAsyncFuncsArray,
        ...severalSyncFuncsArray,
      ]);

      jest.advanceTimersByTime(300);
      await Promise.resolve();

      await expect(result).resolves.toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    }
  );

  it(
    'Асинхронные и синхронные функции. ' +
      'Ограничений нет. ' +
      'Одна синхронная функция выкидывает ошибку',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200 },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const severalSyncFuncsArray = getSyncFunctions([
        { result: 6 },
        { result: 7, throwText: 'Fake error' },
        { result: 8 },
      ]);

      const result = promiseFrame([
        ...severalAsyncFuncsArray,
        ...severalSyncFuncsArray,
      ]);

      jest.advanceTimersByTime(300);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Асинхронные и синхронные функции. ' +
      'Ограничений нет. ' +
      'Один из промисов отклоняется',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200, rejectText: 'Fake error' },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const severalSyncFuncsArray = getSyncFunctions([
        { result: 6 },
        { result: 7 },
        { result: 8 },
      ]);

      const result = promiseFrame([
        ...severalAsyncFuncsArray,
        ...severalSyncFuncsArray,
      ]);

      jest.advanceTimersByTime(300);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Асинхронные и синхронные функции. ' +
      'Ограничение в один промис одновременно. ' +
      'Все функции выполняются',
    async () => {
      jest.useFakeTimers();

      const times = [100, 200, 200, 300, 100];

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: times[0] },
        { result: 2, time: times[1] },
        { result: 3, time: times[2] },
        { result: 4, time: times[3] },
        { result: 5, time: times[4] },
      ]);

      const severalSyncFuncsArray = getSyncFunctions([
        { result: 6 },
        { result: 7 },
        { result: 8 },
      ]);

      const result = promiseFrame(
        [...severalAsyncFuncsArray, ...severalSyncFuncsArray],
        1
      );

      for (let i = 0; i < times.length; i++) {
        jest.advanceTimersByTime(times[i]);
        await Promise.resolve();
      }

      await expect(result).resolves.toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    }
  );

  it(
    'Асинхронные и синхронные функции. ' +
      'Ограничение в один промис одновременно. ' +
      'Один из промисов отклоняется',
    async () => {
      jest.useFakeTimers();

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: 100 },
        { result: 2, time: 200 },
        { result: 3, time: 200, rejectText: 'Fake error' },
        { result: 4, time: 300 },
        { result: 5, time: 100 },
      ]);

      const severalSyncFuncsArray = getSyncFunctions([
        { result: 6 },
        { result: 7 },
        { result: 8 },
      ]);

      const result = promiseFrame(
        [...severalAsyncFuncsArray, ...severalSyncFuncsArray],
        1
      );

      jest.advanceTimersByTime(100);
      await Promise.resolve();
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      jest.advanceTimersByTime(200);
      await Promise.resolve();

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Асинхронные и синхронные функции. ' +
      'Ограничение в один промис одновременно. ' +
      'Одна синхронная функция выкидывает ошибку',
    async () => {
      jest.useFakeTimers();

      const times = [100, 200, 200, 300, 100];

      const severalAsyncFuncsArray = getAsyncFunctions([
        { result: 1, time: times[0] },
        { result: 2, time: times[1] },
        { result: 3, time: times[2] },
        { result: 4, time: times[3] },
        { result: 5, time: times[4] },
      ]);

      const severalSyncFuncsArray = getSyncFunctions([
        { result: 6 },
        { result: 7, throwText: 'Fake error' },
        { result: 8 },
      ]);

      const result = promiseFrame(
        [...severalAsyncFuncsArray, ...severalSyncFuncsArray],
        1
      );

      for (let i = 0; i < times.length; i++) {
        jest.advanceTimersByTime(times[i]);
        await Promise.resolve();
      }

      await expect(result).rejects.toEqual('Fake error');
    }
  );

  it(
    'Все функции синхронные. ' +
      'Ограничений нет. ' +
      'Все функции выполняются',
    async () => {
      const severalSyncFuncsArray = getSyncFunctions([
        { result: 1 },
        { result: 2 },
        { result: 3 },
        { result: 4 },
        { result: 5 },
        { result: 6 },
        { result: 7 },
        { result: 8 },
      ]);
      const result = promiseFrame(severalSyncFuncsArray);
      await expect(result).resolves.toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    }
  );

  it('Первый аргумент не массив', async () => {
    // @ts-ignore
    await expect(() => promiseFrame({ a: 2 })).rejects.toThrow(
      /^INVALID_ARGUMENT$/
    );
  });

  it('Второй аргумент не число', async () => {
    const funcs = [() => 1];
    // @ts-ignore
    await expect(() => promiseFrame(funcs, [])).rejects.toThrow(
      /^INVALID_ARGUMENT$/
    );
  });

  it('Второй аргумент число, равное нулю', async () => {
    const funcs = [() => 1];
    await expect(() => promiseFrame(funcs, 0)).rejects.toThrow(
      /^INVALID_ARGUMENT$/
    );
  });

  it('Второй аргумент отрицательное число', async () => {
    const funcs = [() => 1];
    await expect(() => promiseFrame(funcs, -1)).rejects.toThrow(
      /^INVALID_ARGUMENT$/
    );
  });

  it(
    'Race condition. ' +
      'Много асинхронных функций. ' +
      'Ограничений нет. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const indexes = Array.from(Array(100).keys());

      const severalAsyncFuncsArray = getAsyncFunctions(
        indexes.map((index) => ({ result: index, time: 100 }))
      );

      const result = promiseFrame(severalAsyncFuncsArray);

      for (let i = 0; i < indexes.length; i++) {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      }

      await expect(result).resolves.toEqual(indexes);
    }
  );

  it(
    'Race condition. ' +
      'Много асинхронных функций. ' +
      'Ограничение в два промиса одновременно. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const indexes = Array.from(Array(100).keys());

      const severalAsyncFuncsArray = getAsyncFunctions(
        indexes.map((index) => ({ result: index, time: 100 }))
      );

      const result = promiseFrame(severalAsyncFuncsArray, 2);

      for (let i = 0; i < indexes.length / 2; i++) {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      }

      await expect(result).resolves.toEqual(indexes);
    }
  );

  it(
    'Race condition. ' +
      'Много асинхронных функций. ' +
      'Ограничение в три промиса одновременно. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const indexes = Array.from(Array(102).keys());

      const severalAsyncFuncsArray = getAsyncFunctions(
        indexes.map((index) => ({ result: index, time: 100 }))
      );

      const result = promiseFrame(severalAsyncFuncsArray, 3);

      for (let i = 0; i < indexes.length / 3; i++) {
        jest.advanceTimersByTime(100);
        await Promise.resolve();
      }

      await expect(result).resolves.toEqual(indexes);
    }
  );

  it(
    'Race condition. ' +
      'Много асинхронных функций с разным временем выполнения. ' +
      'Ограничений нет. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const indexes = Array.from(Array(100).keys());

      const times = indexes.map(() => randomInRange(90, 110));

      const severalAsyncFuncsArray = getAsyncFunctions(
        indexes.map((index) => ({
          result: index,
          time: times[index],
        }))
      );

      const result = promiseFrame(severalAsyncFuncsArray);

      jest.advanceTimersByTime(Math.max(...times));
      await Promise.resolve();

      await expect(result).resolves.toEqual(indexes);
    }
  );

  it(
    'Race condition. ' +
      'Много асинхронных функций с разным временем выполнения. ' +
      'Ограничение в два промиса одновременно. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const indexes = Array.from(Array(100).keys());

      const severalAsyncFuncsArray = getAsyncFunctions(
        indexes.map((index) => ({
          result: index,
          time: randomInRange(90, 110),
        }))
      );

      const result = promiseFrame(severalAsyncFuncsArray, 2);

      for (let i = 0; i < indexes.length / 2; i++) {
        jest.advanceTimersByTime(110);
        await Promise.resolve();
      }

      await expect(result).resolves.toEqual(indexes);
    }
  );

  it(
    'Race condition. ' +
      'Много асинхронных функций с разным временем выполнения. ' +
      'Ограничение в три промиса одновременно. ' +
      'Промисы удовлетворяются',
    async () => {
      jest.useFakeTimers();

      const indexes = Array.from(Array(102).keys());

      const severalAsyncFuncsArray = getAsyncFunctions(
        indexes.map((index) => ({
          result: index,
          time: randomInRange(90, 110),
        }))
      );

      const result = promiseFrame(severalAsyncFuncsArray, 3);

      for (let i = 0; i < indexes.length / 3; i++) {
        jest.advanceTimersByTime(110);
        await Promise.resolve();
      }

      await expect(result).resolves.toEqual(indexes);
    }
  );

  it('В момент времени выполняются не более одного промиса', async () => {
    jest.useFakeTimers();

    const severalAsyncFuncsArray = getAsyncFunctions([
      { result: 1, time: 100 },
      { result: 2, time: 100 },
      { result: 3, time: 100 },
      { result: 4, time: 100 },
    ]);

    const result = promiseFrame(severalAsyncFuncsArray, 1);

    expect(severalAsyncFuncsArray[0]).toHaveBeenCalledTimes(1);
    boundRange(1, 3).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
    });

    jest.advanceTimersByTime(100);
    await Promise.resolve();
    boundRange(0, 1).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
    });
    boundRange(2, 3).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
    });

    jest.advanceTimersByTime(100);
    await Promise.resolve();
    boundRange(0, 2).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
    });
    expect(severalAsyncFuncsArray[3]).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(100);
    await Promise.resolve();
    boundRange(0, 3).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(100);
    await Promise.resolve();
    await expect(result).resolves.toEqual([1, 2, 3, 4]);
  });

  it('В момент времени выполняются не более двух промисов', async () => {
    jest.useFakeTimers();

    const severalAsyncFuncsArray = getAsyncFunctions([
      { result: 1, time: 100 },
      { result: 2, time: 300 },
      { result: 3, time: 400 },
      { result: 4, time: 600 },
      { result: 5, time: 200 },
      { result: 6, time: 300 },
    ]);

    // Какая функция будет выполняться в момент времени
    // 000мс 100мс 200мс 300мс 400мс 500мс 600мс 700мс 800мс 900мс 1000мс
    // 1     1->3  3     3     3     3->5  5     5->6  6     6     6->|
    // 2     2     2     2->4  4     4     4     4     4     4->|

    const result = promiseFrame(severalAsyncFuncsArray, 2);

    // 0ms
    boundRange(0, 1).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
    });
    boundRange(2, 5).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
    });

    // 100, 200ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 2).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
      boundRange(3, 5).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
      });
    }

    // 300, 400ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 3).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
      boundRange(4, 5).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
      });
    }

    // 500, 600ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 4).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
      expect(severalAsyncFuncsArray[5]).toHaveBeenCalledTimes(0);
    }

    // 700ms
    jest.advanceTimersByTime(100);
    await Promise.resolve();
    boundRange(0, 5).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
    });

    // 800, 900, 1000ms
    for (let j = 0; j < 3; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    }

    await expect(result).resolves.toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('В момент времени выполняются не более трёх промисов', async () => {
    jest.useFakeTimers();

    const severalAsyncFuncsArray = getAsyncFunctions([
      { result: 1, time: 100 },
      { result: 2, time: 300 },
      { result: 3, time: 500 },
      { result: 4, time: 700 },
      { result: 5, time: 400 },
      { result: 6, time: 400 },
    ]);

    // Какая функция будет выполняться в момент времени
    // 000мс 100мс 200мс 300мс 400мс 500мс 600мс 700мс 800мс 900мс
    // 1     1->4  4     4     4     4     4     4     4->|
    // 2     2     2     2->5  5     5     5     5->|
    // 3     3     3     3     3     3->6  6     6     6     6->|

    const result = promiseFrame(severalAsyncFuncsArray, 3);

    // 0ms
    boundRange(0, 2).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
    });
    boundRange(3, 5).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
    });

    // 100, 200ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 3).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
      boundRange(4, 5).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
      });
    }

    // 300, 400ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 4).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
      expect(severalAsyncFuncsArray[5]).toHaveBeenCalledTimes(0);
    }

    // 500, 600ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 5).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
    }

    // 700, 800, 900ms
    for (let j = 0; j < 3; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    }

    await expect(result).resolves.toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('В момент времени выполняются не более четырёх промисов', async () => {
    jest.useFakeTimers();

    const severalAsyncFuncsArray = getAsyncFunctions([
      { result: 1, time: 100 },
      { result: 2, time: 300 },
      { result: 3, time: 500 },
      { result: 4, time: 700 },
      { result: 5, time: 800 },
      { result: 6, time: 800 },
      { result: 7, time: 600 },
      { result: 8, time: 300 },
    ]);

    // Какая функция будет выполняться в момент времени
    // 000мс 100мс 200мс 300мс 400мс 500мс 600мс 700мс 800мс 900мс 1000мс 1100мс
    // 1     1->5  5     5     5     5     5     5     5     5->|
    // 2     2     2     2->6  6     6     6     6     6     6     6      6->|
    // 3     3     3     3     3     3->7  7     7     7     7     7      7->|
    // 4     4     4     4     4     4     4     4->8  8     8     8->|

    const result = promiseFrame(severalAsyncFuncsArray, 4);

    // 0ms
    boundRange(0, 3).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
    });
    boundRange(4, 7).forEach((i) => {
      expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
    });

    // 100, 200ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 4).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
      boundRange(5, 7).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
      });
    }

    // 300, 400ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 5).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
      boundRange(6, 7).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(0);
      });
    }

    // 500, 600ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 6).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
      expect(severalAsyncFuncsArray[7]).toHaveBeenCalledTimes(0);
    }

    // 700, 800ms
    for (let j = 0; j < 2; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      boundRange(0, 7).forEach((i) => {
        expect(severalAsyncFuncsArray[i]).toHaveBeenCalledTimes(1);
      });
    }

    // 900, 1000, 1100ms
    for (let j = 0; j < 3; j++) {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    }

    await expect(result).resolves.toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

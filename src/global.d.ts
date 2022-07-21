declare global {
  interface Array<T> {
    count(): number;
    insert(index: number, value: T): Array<T>;
    remove(value: T): Array<T>;
  }
}

export {};

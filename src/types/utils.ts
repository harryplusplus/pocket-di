// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

export type Constructor<T> = new (...args: Any[]) => T

export type MaybePromise<T> = T | Promise<T>

export interface AsyncLock {
  acquire<T>(fn: () => Promise<T>): Promise<T>
}

class AsyncLockImpl implements AsyncLock {
  promise = Promise.resolve()

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    const previous = this.promise

    let release!: () => void

    this.promise = new Promise((resolve) => {
      release = resolve
    })

    await previous

    try {
      return await fn()
    } finally {
      release()
    }
  }
}

export function createAsyncLock(): AsyncLock {
  return new AsyncLockImpl()
}

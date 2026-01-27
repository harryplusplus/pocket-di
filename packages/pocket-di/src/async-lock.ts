/**
 * @file Implements an async lock for serializing access to shared resources.
 * Used by container's async methods when accessing container's context.
 */

export class AsyncLock {
  private promise = Promise.resolve()

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

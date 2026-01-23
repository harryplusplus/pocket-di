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

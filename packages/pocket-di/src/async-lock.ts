/**
 * @file async lock을 구현하는 class입니다.
 * container의 async method들이 container의 context에 접근할 때 사용합니다.
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

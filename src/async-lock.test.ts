import { describe, expect, it } from 'vitest'

import { createAsyncLock } from './async-lock.ts'

describe('AsyncLock', () => {
  it('should execute functions sequentially', async () => {
    const lock = createAsyncLock()
    const results: number[] = []

    await Promise.all([
      lock.acquire(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        results.push(1)
      }),
      lock.acquire(async () => {
        results.push(2)
        await Promise.resolve()
      }),
    ])

    expect(results).toEqual([1, 2])
  })

  it('should return the result of the function', async () => {
    const lock = createAsyncLock()

    const result = await lock.acquire(async () => {
      await Promise.resolve()
      return 42
    })

    expect(result).toBe(42)
  })

  it('should release lock even if function throws', async () => {
    const lock = createAsyncLock()

    await expect(
      lock.acquire(async () => {
        await Promise.resolve()
        throw new Error('test error')
      }),
    ).rejects.toThrow('test error')

    const result = await lock.acquire(async () => Promise.resolve('success'))
    expect(result).toBe('success')
  })
})

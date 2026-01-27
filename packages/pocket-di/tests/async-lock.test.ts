import { describe, expect, it } from 'vitest'

import { AsyncLock } from '../src/async-lock.ts'

describe('async-lock', () => {
  describe('sequential execution', () => {
    it('should execute async functions sequentially', async () => {
      const lock = new AsyncLock()
      const results: number[] = []

      await lock.acquire(async () => {
        results.push(1)
        await new Promise((resolve) => setTimeout(resolve, 10))
        results.push(2)
      })

      await lock.acquire(async () => {
        results.push(3)
        await new Promise((resolve) => setTimeout(resolve, 10))
        results.push(4)
      })

      expect(results).toEqual([1, 2, 3, 4])
    })

    it('should return the result of the async function', async () => {
      const lock = new AsyncLock()

      const result = await lock.acquire(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return 42
      })

      expect(result).toBe(42)
    })
  })

  describe('concurrent calls', () => {
    it('should serialize concurrent acquire calls', async () => {
      const lock = new AsyncLock()
      const results: string[] = []
      let executionOrder = 0

      const task1 = lock.acquire(async () => {
        const order = ++executionOrder
        await new Promise((resolve) => setTimeout(resolve, 20))
        results.push(`task1-${order}`)
      })

      const task2 = lock.acquire(async () => {
        const order = ++executionOrder
        await new Promise((resolve) => setTimeout(resolve, 10))
        results.push(`task2-${order}`)
      })

      const task3 = lock.acquire(async () => {
        const order = ++executionOrder
        await new Promise((resolve) => setTimeout(resolve, 5))
        results.push(`task3-${order}`)
      })

      await Promise.all([task1, task2, task3])

      expect(results).toEqual(['task1-1', 'task2-2', 'task3-3'])
    })

    it('should handle multiple concurrent calls with return values', async () => {
      const lock = new AsyncLock()

      const results = await Promise.all([
        lock.acquire(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return 'first'
        }),
        lock.acquire(async () => {
          await new Promise((resolve) => setTimeout(resolve, 5))
          return 'second'
        }),
        lock.acquire(async () => {
          await new Promise((resolve) => setTimeout(resolve, 1))
          return 'third'
        }),
      ])

      expect(results).toEqual(['first', 'second', 'third'])
    })
  })

  describe('error handling', () => {
    it('should propagate errors from the async function', async () => {
      const lock = new AsyncLock()

      await expect(
        lock.acquire(() => {
          throw new Error('Test error')
        }),
      ).rejects.toThrow('Test error')
    })

    it('should continue to accept new calls after error', async () => {
      const lock = new AsyncLock()
      const results: string[] = []

      await expect(
        lock.acquire(() => {
          results.push('before-error')
          throw new Error('Test error')
        }),
      ).rejects.toThrow('Test error')

      await lock.acquire(async () => {
        await Promise.resolve()
        results.push('after-error')
      })

      expect(results).toEqual(['before-error', 'after-error'])
    })
  })

  describe('reusable lock', () => {
    it('should allow reuse after completion', async () => {
      const lock = new AsyncLock()

      const result1 = await lock.acquire(async () => {
        await Promise.resolve()
        return 'first'
      })

      const result2 = await lock.acquire(async () => {
        await Promise.resolve()
        return 'second'
      })

      expect(result1).toBe('first')
      expect(result2).toBe('second')
    })
  })
})

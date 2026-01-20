import { describe, expect, it, vi } from 'vitest'

import type { ContainerImpl } from '../container.ts'
import { destroyChildren } from './destroy-children.ts'

describe('destroyChildren', () => {
  it('should destroy all children in reverse order', async () => {
    const destroyOrder: number[] = []

    const child1 = {
      destroy: vi.fn().mockImplementation(() => {
        destroyOrder.push(1)
        return Promise.resolve()
      }),
    } as unknown as ContainerImpl

    const child2 = {
      destroy: vi.fn().mockImplementation(() => {
        destroyOrder.push(2)
        return Promise.resolve()
      }),
    } as unknown as ContainerImpl

    const child3 = {
      destroy: vi.fn().mockImplementation(() => {
        destroyOrder.push(3)
        return Promise.resolve()
      }),
    } as unknown as ContainerImpl

    const children = [child1, child2, child3]

    await destroyChildren({ children })

    expect(child1.destroy).toHaveBeenCalledOnce()
    expect(child2.destroy).toHaveBeenCalledOnce()
    expect(child3.destroy).toHaveBeenCalledOnce()
    expect(destroyOrder).toEqual([3, 2, 1])
    expect(children).toHaveLength(0)
  })

  it('should clear children array', async () => {
    const child = {
      destroy: vi.fn().mockResolvedValue(undefined),
    } as unknown as ContainerImpl

    const children = [child]

    await destroyChildren({ children })

    expect(children).toHaveLength(0)
  })
})

describe('destroyChildren error handling', () => {
  it('should continue destroying when child throws error', async () => {
    const child1 = {
      destroy: vi.fn().mockRejectedValue(new Error('destroy failed')),
    } as unknown as ContainerImpl

    const child2 = {
      destroy: vi.fn().mockResolvedValue(undefined),
    } as unknown as ContainerImpl

    const children = [child1, child2]

    await destroyChildren({ children })

    expect(child1.destroy).toHaveBeenCalledOnce()
    expect(child2.destroy).toHaveBeenCalledOnce()
    expect(children).toHaveLength(0)
  })
})

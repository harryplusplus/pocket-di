import { describe, expect, it, vi } from 'vitest'

import type { ContainerImpl } from '../container.ts'
import { Registry } from '../registry.ts'
import type {
  ProviderRegistry,
  SingletonRegistry,
} from '../types/compositions.ts'
import type { Provider } from '../types/provider.ts'
import { destroyContainer } from './destroy-container.ts'

describe('destroyContainer', () => {
  it('should destroy children and singletons', async () => {
    const child1 = {
      destroy: vi.fn().mockResolvedValue(undefined),
    } as unknown as ContainerImpl

    const child2 = {
      destroy: vi.fn().mockResolvedValue(undefined),
    } as unknown as ContainerImpl

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)

    const container = {
      children: [child1, child2],
      singletonRegistry,
      providerRegistry,
    } as unknown as ContainerImpl

    await destroyContainer({ container })

    expect(child1.destroy).toHaveBeenCalledOnce()
    expect(child2.destroy).toHaveBeenCalledOnce()
    expect(container.children).toHaveLength(0)
    expect(providerRegistry.map.size).toBe(0)
    expect(providerRegistry.parent).toBeNull()
  })

  it('should clear provider registry', async () => {
    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', {} as Provider)

    const container = {
      children: [],
      singletonRegistry,
      providerRegistry,
    } as unknown as ContainerImpl

    await destroyContainer({ container })

    expect(providerRegistry.map.size).toBe(0)
  })
})

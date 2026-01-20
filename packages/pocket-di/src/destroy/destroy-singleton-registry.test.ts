import { describe, expect, it, vi } from 'vitest'

import { Registry } from '../registry.ts'
import type {
  ProviderRegistry,
  SingletonRegistry,
} from '../types/compositions.ts'
import type { ClassProvider, FactoryProvider } from '../types/provider.ts'
import { preDestroy } from '../types/symbols.ts'
import { destroySingletonRegistry } from './destroy-singleton-registry.ts'

describe('destroySingletonRegistry with class provider', () => {
  it('should call preDestroy on singleton', async () => {
    const preDestroyFn = vi.fn()

    class TestClass {
      [preDestroy] = preDestroyFn
    }

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const singleton = new TestClass()
    singletonRegistry.map.set('test', singleton)

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    await destroySingletonRegistry({ singletonRegistry }, { providerRegistry })

    expect(preDestroyFn).toHaveBeenCalledOnce()
    expect(singletonRegistry.map.size).toBe(0)
    expect(singletonRegistry.parent).toBeNull()
  })

  it('should skip preDestroy if not defined', async () => {
    class TestClass {}

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    singletonRegistry.map.set('test', new TestClass())

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    await expect(
      destroySingletonRegistry({ singletonRegistry }, { providerRegistry }),
    ).resolves.toBeUndefined()
  })
})

describe('destroySingletonRegistry with factory provider', () => {
  it('should call preDestroy on singleton', async () => {
    const preDestroyFn = vi.fn()

    const provider: FactoryProvider = {
      provide: 'test',
      useFactory: () => ({}),
      preDestroy: preDestroyFn,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const singleton = {}
    singletonRegistry.map.set('test', singleton)

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    await destroySingletonRegistry({ singletonRegistry }, { providerRegistry })

    expect(preDestroyFn).toHaveBeenCalledWith(singleton)
    expect(singletonRegistry.map.size).toBe(0)
  })
})

describe('destroySingletonRegistry error handling', () => {
  it('should continue when preDestroy throws error', async () => {
    const preDestroy1 = vi.fn().mockRejectedValue(new Error('error'))
    const preDestroy2 = vi.fn()

    class TestClass1 {
      [preDestroy] = preDestroy1
    }

    class TestClass2 {
      [preDestroy] = preDestroy2
    }

    const provider1: ClassProvider = { provide: 'test1', useClass: TestClass1 }

    const provider2: ClassProvider = { provide: 'test2', useClass: TestClass2 }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    singletonRegistry.map.set('test1', new TestClass1())
    singletonRegistry.map.set('test2', new TestClass2())

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test1', provider1)
    providerRegistry.map.set('test2', provider2)

    await destroySingletonRegistry({ singletonRegistry }, { providerRegistry })

    expect(preDestroy1).toHaveBeenCalled()
    expect(preDestroy2).toHaveBeenCalled()
  })

  it('should throw error when provider not found', async () => {
    const singletonRegistry: SingletonRegistry = new Registry(null)
    singletonRegistry.map.set('test', {})

    const providerRegistry: ProviderRegistry = new Registry(null)

    await expect(
      destroySingletonRegistry({ singletonRegistry }, { providerRegistry }),
    ).rejects.toThrow('provider for token "test" not found during cleanup')
  })
})

describe('destroySingletonRegistry order', () => {
  it('should destroy in reverse order', async () => {
    const order: number[] = []

    class TestClass1 {
      [preDestroy] = vi.fn().mockImplementation(() => {
        order.push(1)
        return Promise.resolve()
      })
    }

    class TestClass2 {
      [preDestroy] = vi.fn().mockImplementation(() => {
        order.push(2)
        return Promise.resolve()
      })
    }

    const provider1: ClassProvider = { provide: 'test1', useClass: TestClass1 }

    const provider2: ClassProvider = { provide: 'test2', useClass: TestClass2 }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    singletonRegistry.map.set('test1', new TestClass1())
    singletonRegistry.map.set('test2', new TestClass2())

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test1', provider1)
    providerRegistry.map.set('test2', provider2)

    await destroySingletonRegistry({ singletonRegistry }, { providerRegistry })

    expect(order).toEqual([2, 1])
  })
})

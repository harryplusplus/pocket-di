import { describe, expect, it } from 'vitest'

import { Registry } from '../registry.ts'
import type { ClassProvider } from '../types/class-provider.ts'
import type {
  ProviderRegistry,
  SingletonRegistry,
} from '../types/compositions.ts'
import { inject } from '../types/symbols.ts'
import { token } from '../types/token.ts'
import type { ValueProvider } from '../types/value-provider.ts'
import { resolveRecursiveAsync } from './resolve-recursive-async.ts'

describe('resolveRecursiveAsync with singleton', () => {
  it('should return existing singleton', async () => {
    const instance = { value: 'test' }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    singletonRegistry.map.set('test', instance)

    const providerRegistry: ProviderRegistry = new Registry(null)

    const result = await resolveRecursiveAsync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(result).toBe(instance)
  })
})

describe('resolveRecursiveAsync with value provider', () => {
  it('should return value from provider', async () => {
    const value = { data: 'test' }

    const provider: ValueProvider = { provide: token('test'), useValue: value }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    const result = await resolveRecursiveAsync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(result).toBe(value)
  })
})

describe('resolveRecursiveAsync create instance', () => {
  it('should create and cache singleton instance', async () => {
    class TestClass {
      value = 'test'
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    const result = await resolveRecursiveAsync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(result).toBeInstanceOf(TestClass)
    expect(singletonRegistry.map.get('test')).toBe(result)
  })

  it('should not cache transient instance', async () => {
    class TestClass {}

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
      scope: 'transient',
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    await resolveRecursiveAsync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(singletonRegistry.map.get('test')).toBeUndefined()
  })
})

describe('resolveRecursiveAsync with dependencies', () => {
  it('should resolve dependencies recursively', async () => {
    const dep = { value: 'dep' }

    const depProvider: ValueProvider = { provide: token('dep'), useValue: dep }

    class TestClass {
      static [inject] = [token('dep')] as const
      deps: unknown[]
      constructor(deps: unknown[]) {
        this.deps = deps
      }
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', depProvider)
    providerRegistry.map.set('test', provider)

    const result = await resolveRecursiveAsync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(result).toBeInstanceOf(TestClass)
    expect((result as TestClass).deps).toEqual([dep])
  })
})

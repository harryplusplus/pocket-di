import { describe, expect, it } from 'vitest'

import { Registry } from '../registry.ts'
import type {
  ProviderRegistry,
  SingletonRegistry,
} from '../types/compositions.ts'
import type { ClassProvider, ValueProvider } from '../types/provider.ts'
import { inject } from '../types/symbols.ts'
import { resolveRecursiveSync } from './resolve-recursive-sync.ts'

describe('resolveRecursiveSync with singleton', () => {
  it('should return existing singleton', () => {
    const instance = { value: 'test' }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    singletonRegistry.map.set('test', instance)

    const providerRegistry: ProviderRegistry = new Registry(null)

    const result = resolveRecursiveSync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(result).toBe(instance)
  })
})

describe('resolveRecursiveSync with value provider', () => {
  it('should return value from provider', () => {
    const value = { data: 'test' }

    const provider: ValueProvider = { provide: 'test', useValue: value }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    const result = resolveRecursiveSync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(result).toBe(value)
  })
})

describe('resolveRecursiveSync create instance', () => {
  it('should create and cache singleton instance', () => {
    class TestClass {
      value = 'test'
    }

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    const result = resolveRecursiveSync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(result).toBeInstanceOf(TestClass)
    expect(singletonRegistry.map.get('test')).toBe(result)
  })

  it('should not cache transient instance', () => {
    class TestClass {}

    const provider: ClassProvider = {
      provide: 'test',
      useClass: TestClass,
      scope: 'transient',
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    resolveRecursiveSync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(singletonRegistry.map.get('test')).toBeUndefined()
  })
})

describe('resolveRecursiveSync with dependencies', () => {
  it('should resolve dependencies recursively', () => {
    const dep = { value: 'dep' }

    const depProvider: ValueProvider = { provide: 'dep', useValue: dep }

    class TestClass {
      static [inject] = ['dep'] as const
      deps: unknown[]
      constructor(deps: unknown[]) {
        this.deps = deps
      }
    }

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', depProvider)
    providerRegistry.map.set('test', provider)

    const result = resolveRecursiveSync(
      { singletonRegistry },
      { providerRegistry, token: 'test' },
    )

    expect(result).toBeInstanceOf(TestClass)
    expect((result as TestClass).deps).toEqual([dep])
  })
})

import { describe, expect, it } from 'vitest'

import { Registry } from '../registry.ts'
import type {
  ProviderRegistry,
  SingletonRegistry,
} from '../types/compositions.ts'
import type { ClassProvider, ValueProvider } from '../types/provider.ts'
import { resolveInstanceOrProvider } from './resolve-singleton-or-value.ts'

describe('resolveInstanceOrProvider with singleton', () => {
  it('should return singleton instance when exists', () => {
    const singletonRegistry: SingletonRegistry = new Registry(null)
    const instance = { value: 'test' }
    singletonRegistry.map.set('test', instance)

    const providerRegistry: ProviderRegistry = new Registry(null)

    const result = resolveInstanceOrProvider({
      singletonRegistry,
      providerRegistry,
      token: 'test',
    })

    expect(result).toEqual({ kind: 'instance', instance })
  })
})

describe('resolveInstanceOrProvider with value provider', () => {
  it('should return value from value provider', () => {
    const value = { data: 'test' }
    const provider: ValueProvider = { provide: 'test', useValue: value }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    const result = resolveInstanceOrProvider({
      singletonRegistry,
      providerRegistry,
      token: 'test',
    })

    expect(result).toEqual({ kind: 'instance', instance: value })
  })
})

describe('resolveInstanceOrProvider with class provider', () => {
  it('should return provider for class provider', () => {
    const provider: ClassProvider = { provide: 'test', useClass: class {} }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('test', provider)

    const result = resolveInstanceOrProvider({
      singletonRegistry,
      providerRegistry,
      token: 'test',
    })

    expect(result).toEqual({ kind: 'provider', provider })
  })
})

describe('resolveInstanceOrProvider errors', () => {
  it('should throw error when provider not found', () => {
    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)

    expect(() =>
      resolveInstanceOrProvider({
        singletonRegistry,
        providerRegistry,
        token: 'missing',
      }),
    ).toThrow('provider for token "missing" not found during resolve')
  })
})

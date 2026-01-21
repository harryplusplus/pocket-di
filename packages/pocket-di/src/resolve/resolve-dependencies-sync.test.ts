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
import { resolveDependenciesSync } from './resolve-dependencies-sync.ts'

describe('resolveDependenciesSync with tuple', () => {
  it('should resolve tuple dependencies', () => {
    const dep1 = { value: 'dep1' }
    const dep2 = { value: 'dep2' }

    const provider1: ValueProvider = { provide: token('dep1'), useValue: dep1 }

    const provider2: ValueProvider = { provide: token('dep2'), useValue: dep2 }

    class TestClass {
      static [inject] = [token('dep1'), token('dep2')] as const
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep1', provider1)
    providerRegistry.map.set('dep2', provider2)

    const result = resolveDependenciesSync(
      { singletonRegistry },
      { providerRegistry, provider },
    )

    expect(result).toEqual([dep1, dep2])
  })

  it('should resolve empty tuple dependencies', () => {
    class TestClass {
      static [inject] = [] as const
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)

    const result = resolveDependenciesSync(
      { singletonRegistry },
      { providerRegistry, provider },
    )

    expect(result).toEqual([])
  })
})

describe('resolveDependenciesSync with record', () => {
  it('should resolve record dependencies', () => {
    const dep1 = { value: 'dep1' }
    const dep2 = { value: 'dep2' }

    const provider1: ValueProvider = { provide: token('dep1'), useValue: dep1 }

    const provider2: ValueProvider = { provide: token('dep2'), useValue: dep2 }

    class TestClass {
      static [inject] = { a: token('dep1'), b: token('dep2') }
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep1', provider1)
    providerRegistry.map.set('dep2', provider2)

    const result = resolveDependenciesSync(
      { singletonRegistry },
      { providerRegistry, provider },
    )

    expect(result).toEqual({ a: dep1, b: dep2 })
  })

  it('should resolve empty record dependencies', () => {
    class TestClass {
      static [inject] = {}
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)

    const result = resolveDependenciesSync(
      { singletonRegistry },
      { providerRegistry, provider },
    )

    expect(result).toEqual({})
  })
})

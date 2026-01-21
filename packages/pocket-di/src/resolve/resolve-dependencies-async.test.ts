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
import { resolveDependenciesAsync } from './resolve-dependencies-async.ts'

describe('resolveDependenciesAsync with tuple', () => {
  it('should resolve tuple dependencies', async () => {
    const dep1 = { value: 'dep1' }
    const dep2 = { value: 'dep2' }

    const provider1: ValueProvider = { provide: token('dep1'), useValue: dep1 }

    const provider2: ValueProvider = { provide: token('dep2'), useValue: dep2 }

    class TestClass {
      static [inject] = { dep1: token('dep1'), dep2: token('dep2') }
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep1', provider1)
    providerRegistry.map.set('dep2', provider2)

    const result = await resolveDependenciesAsync(
      { singletonRegistry },
      { providerRegistry, provider },
    )

    expect(result).toEqual([dep1, dep2])
  })

  it('should resolve empty tuple dependencies', async () => {
    class TestClass {
      static [inject] = {}
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)

    const result = await resolveDependenciesAsync(
      { singletonRegistry },
      { providerRegistry, provider },
    )

    expect(result).toEqual([])
  })
})

describe('resolveDependenciesAsync with record', () => {
  it('should resolve record dependencies', async () => {
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

    const result = await resolveDependenciesAsync(
      { singletonRegistry },
      { providerRegistry, provider },
    )

    expect(result).toEqual({ a: dep1, b: dep2 })
  })

  it('should resolve empty record dependencies', async () => {
    class TestClass {
      static [inject] = {}
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const singletonRegistry: SingletonRegistry = new Registry(null)
    const providerRegistry: ProviderRegistry = new Registry(null)

    const result = await resolveDependenciesAsync(
      { singletonRegistry },
      { providerRegistry, provider },
    )

    expect(result).toEqual({})
  })
})

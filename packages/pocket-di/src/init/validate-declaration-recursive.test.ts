import { describe, expect, it } from 'vitest'

import { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import { Registry } from '../registry.ts'
import type { ClassProvider } from '../types/class-provider.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import type { FactoryProvider } from '../types/factory-provider.ts'
import { inject } from '../types/symbols.ts'
import { token } from '../types/token.ts'
import type { ValueProvider } from '../types/value-provider.ts'
import { validateDeclarationRecursive } from './validate-declaration-recursive.ts'

describe('validateDeclarationRecursive with class provider', () => {
  it('should validate class provider with dependencies', () => {
    class DepClass {}

    class TestClass {
      static [inject] = [token('dep')] as const
    }

    const depProvider: ClassProvider = {
      provide: token('dep'),
      useClass: DepClass,
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', depProvider)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({ provider, providerRegistry, checker }),
    ).not.toThrow()
  })

  it('should throw error for missing dependency in class', () => {
    class TestClass {
      static [inject] = [token('missing')] as const
    }

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({ provider, providerRegistry, checker }),
    ).toThrow('dependency "missing" is not registered')
  })
})

describe('validateDeclarationRecursive with factory provider', () => {
  it('should validate factory provider with dependencies', () => {
    const depProvider: ValueProvider = { provide: token('dep'), useValue: {} }

    const provider: FactoryProvider = {
      provide: token('test'),
      inject: [token('dep')] as const,
      useFactory: () => ({}),
    }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', depProvider)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({ provider, providerRegistry, checker }),
    ).not.toThrow()
  })

  it('should throw error for missing dependency in factory', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      inject: [token('missing')] as const,
      useFactory: () => ({}),
    }

    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({ provider, providerRegistry, checker }),
    ).toThrow('dependency "missing" is not registered')
  })
})

describe('validateDeclarationRecursive with value provider', () => {
  it('should not validate value provider', () => {
    const provider: ValueProvider = { provide: token('test'), useValue: {} }

    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({ provider, providerRegistry, checker }),
    ).not.toThrow()
  })
})

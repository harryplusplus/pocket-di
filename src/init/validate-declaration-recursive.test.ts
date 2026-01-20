import { describe, expect, it } from 'vitest'

import { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import { Registry } from '../registry.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import type {
  ClassProvider,
  FactoryProvider,
  ValueProvider,
} from '../types/provider.ts'
import { inject } from '../types/symbols.ts'
import { validateDeclarationRecursive } from './validate-declaration-recursive.ts'

describe('validateDeclarationRecursive with class provider', () => {
  it('should validate class provider with dependencies', () => {
    class DepClass {}

    class TestClass {
      static [inject] = ['dep'] as const
    }

    const depProvider: ClassProvider = { provide: 'dep', useClass: DepClass }

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', depProvider)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({ provider, providerRegistry, checker }),
    ).not.toThrow()
  })

  it('should throw error for missing dependency in class', () => {
    class TestClass {
      static [inject] = ['missing'] as const
    }

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({ provider, providerRegistry, checker }),
    ).toThrow('dependency "missing" is not registered')
  })
})

describe('validateDeclarationRecursive with factory provider', () => {
  it('should validate factory provider with dependencies', () => {
    const depProvider: ValueProvider = { provide: 'dep', useValue: {} }

    const provider: FactoryProvider = {
      provide: 'test',
      inject: ['dep'] as const,
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
      provide: 'test',
      inject: ['missing'] as const,
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
    const provider: ValueProvider = { provide: 'test', useValue: {} }

    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationRecursive({ provider, providerRegistry, checker }),
    ).not.toThrow()
  })
})

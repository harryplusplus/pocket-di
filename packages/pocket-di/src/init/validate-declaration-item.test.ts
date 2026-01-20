import { describe, expect, it } from 'vitest'

import { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import { Registry } from '../registry.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import type { ClassProvider, ValueProvider } from '../types/provider.ts'
import { inject } from '../types/symbols.ts'
import { validateDeclarationItem } from './validate-declaration-item.ts'

describe('validateDeclarationItem errors', () => {
  it('should throw error when dependency not registered', () => {
    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationItem({
        item: 'missing-dep',
        providerRegistry,
        token: 'test',
        className: 'TestClass',
        checker,
      }),
    ).toThrow(
      'Cannot register token "test" (class "TestClass"): dependency "missing-dep" is not registered',
    )
  })

  it('should throw error without class name', () => {
    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationItem({
        item: 'missing-dep',
        providerRegistry,
        token: 'test',
        className: null,
        checker,
      }),
    ).toThrow(
      'Cannot register token "test": dependency "missing-dep" is not registered',
    )
  })
})

describe('validateDeclarationItem success', () => {
  it('should push item to checker when dependency exists', () => {
    const provider: ValueProvider = { provide: 'dep', useValue: {} }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', provider)

    const checker = new CircularDependencyChecker()

    validateDeclarationItem({
      item: 'dep',
      providerRegistry,
      token: 'test',
      className: null,
      checker,
    })

    expect(checker.chain.has('dep')).toBe(true)
  })
})

describe('validateDeclarationItem nested', () => {
  it('should validate nested dependencies', () => {
    class DepClass {
      static [inject] = ['nested-dep'] as const
    }

    const depProvider: ClassProvider = { provide: 'dep', useClass: DepClass }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', depProvider)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclarationItem({
        item: 'dep',
        providerRegistry,
        token: 'test',
        className: null,
        checker,
      }),
    ).toThrow(
      'Cannot register token "dep" (class "DepClass"): dependency "nested-dep" is not registered',
    )
  })
})

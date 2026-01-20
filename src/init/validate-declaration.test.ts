import { describe, expect, it } from 'vitest'

import { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import { Registry } from '../registry.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import type { ValueProvider } from '../types/provider.ts'
import { validateDeclaration } from './validate-declaration.ts'

describe('validateDeclaration tuple', () => {
  it('should validate tuple declaration with registered dependencies', () => {
    const provider1: ValueProvider = { provide: 'dep1', useValue: {} }

    const provider2: ValueProvider = { provide: 'dep2', useValue: {} }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep1', provider1)
    providerRegistry.map.set('dep2', provider2)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclaration({
        token: 'test',
        declaration: ['dep1', 'dep2'] as const,
        providerRegistry,
        checker,
        className: 'TestClass',
      }),
    ).not.toThrow()
  })

  it('should throw error for missing dependency in tuple', () => {
    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclaration({
        token: 'test',
        declaration: ['missing'] as const,
        providerRegistry,
        checker,
        className: 'TestClass',
      }),
    ).toThrow('dependency "missing" is not registered')
  })
})

describe('validateDeclaration record', () => {
  it('should validate record declaration with registered dependencies', () => {
    const provider1: ValueProvider = { provide: 'dep1', useValue: {} }

    const provider2: ValueProvider = { provide: 'dep2', useValue: {} }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep1', provider1)
    providerRegistry.map.set('dep2', provider2)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclaration({
        token: 'test',
        declaration: { a: 'dep1', b: 'dep2' },
        providerRegistry,
        checker,
        className: 'TestClass',
      }),
    ).not.toThrow()
  })

  it('should throw error for missing dependency in record', () => {
    const providerRegistry: ProviderRegistry = new Registry(null)
    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclaration({
        token: 'test',
        declaration: { dep: 'missing' },
        providerRegistry,
        checker,
        className: 'TestClass',
      }),
    ).toThrow('dependency "missing" is not registered')
  })

  it('should throw error for invalid property name in record', () => {
    const provider: ValueProvider = { provide: 'dep', useValue: {} }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', provider)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclaration({
        token: 'test',
        declaration: { constructor: 'dep' },
        providerRegistry,
        checker,
        className: 'TestClass',
      }),
    ).toThrow('invalid dependency property name "constructor"')
  })
})

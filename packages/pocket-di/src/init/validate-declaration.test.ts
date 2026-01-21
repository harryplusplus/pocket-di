import { describe, expect, it } from 'vitest'

import { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import { Registry } from '../registry.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import { token } from '../types/token.ts'
import type { ValueProvider } from '../types/value-provider.ts'
import { validateDeclaration } from './validate-declaration.ts'

describe('validateDeclaration record', () => {
  it('should validate record declaration with registered dependencies', () => {
    const provider1: ValueProvider = { provide: token('dep1'), useValue: {} }

    const provider2: ValueProvider = { provide: token('dep2'), useValue: {} }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep1', provider1)
    providerRegistry.map.set('dep2', provider2)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclaration({
        token: 'test',
        declaration: { a: token('dep1'), b: token('dep2') },
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
        declaration: { dep: token('missing') },
        providerRegistry,
        checker,
        className: 'TestClass',
      }),
    ).toThrow('dependency "missing" is not registered')
  })

  it('should throw error for invalid property name in record', () => {
    const provider: ValueProvider = { provide: token('dep'), useValue: {} }

    const providerRegistry: ProviderRegistry = new Registry(null)
    providerRegistry.map.set('dep', provider)

    const checker = new CircularDependencyChecker()

    expect(() =>
      validateDeclaration({
        token: 'test',
        declaration: { constructor: token('dep') },
        providerRegistry,
        checker,
        className: 'TestClass',
      }),
    ).toThrow('invalid dependency property name "constructor"')
  })
})

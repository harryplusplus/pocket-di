import { describe, expect, it } from 'vitest'

import { providerToDeclaration } from './compositions.ts'
import type { ClassProvider, FactoryProvider } from './provider.ts'
import { inject } from './symbols.ts'

describe('providerToDeclaration', () => {
  it('should return declaration from class provider', () => {
    class TestClass {
      static [inject] = ['dep1', 'dep2'] as const
    }

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const result = providerToDeclaration(provider)

    expect(result).toEqual(['dep1', 'dep2'])
  })

  it('should return empty object from class provider without inject', () => {
    class TestClass {}

    const provider: ClassProvider = { provide: 'test', useClass: TestClass }

    const result = providerToDeclaration(provider)

    expect(result).toEqual({})
  })

  it('should return declaration from factory provider', () => {
    const provider: FactoryProvider = {
      provide: 'test',
      inject: { dep1: 'dep1', dep2: 'dep2' },
      useFactory: () => ({}),
    }

    const result = providerToDeclaration(provider)

    expect(result).toEqual({ dep1: 'dep1', dep2: 'dep2' })
  })

  it('should return empty object from factory provider without inject', () => {
    const provider: FactoryProvider = {
      provide: 'test',
      useFactory: () => ({}),
    }

    const result = providerToDeclaration(provider)

    expect(result).toEqual({})
  })
})

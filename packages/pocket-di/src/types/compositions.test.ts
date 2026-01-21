import { describe, expect, it } from 'vitest'

import type { ClassProvider } from './class-provider.ts'
import { providerToDeclaration } from './compositions.ts'
import type { FactoryProvider } from './factory-provider.ts'
import { token } from './token.ts'

describe('providerToDeclaration', () => {
  it('should return empty object from class provider without inject', () => {
    class TestClass {}

    const provider: ClassProvider = {
      provide: token('test'),
      useClass: TestClass,
    }

    const result = providerToDeclaration(provider)

    expect(result).toEqual({})
  })

  it('should return declaration from factory provider', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      inject: { dep1: token('dep1'), dep2: token('dep2') },
      useFactory: () => ({}),
    }

    const result = providerToDeclaration(provider)

    expect(result).toEqual({ dep1: 'dep1', dep2: 'dep2' })
  })

  it('should return empty object from factory provider without inject', () => {
    const provider: FactoryProvider = {
      provide: token('test'),
      useFactory: () => ({}),
    }

    const result = providerToDeclaration(provider)

    expect(result).toEqual({})
  })
})

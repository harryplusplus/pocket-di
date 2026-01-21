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
    const deps = { dep1: token('dep1'), dep2: token('dep2') }
    const provider: FactoryProvider = {
      provide: token('test'),
      inject: deps,
      useFactory: () => ({}),
    }

    const result = providerToDeclaration(provider)

    expect(result).toEqual(deps)
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

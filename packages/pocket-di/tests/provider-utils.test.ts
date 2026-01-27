import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../src/class-provider.ts'
import { defineFactoryProvider } from '../src/factory-provider.ts'
import { normalizeProvider } from '../src/provider-utils.ts'
import { defineValueProvider } from '../src/value-provider.ts'

class TestService {}

describe('provider-utils', () => {
  describe('normalizeProvider', () => {
    describe('when provider is InjectableConstructor', () => {
      it('should convert to ClassProvider', () => {
        const result = normalizeProvider(TestService)

        expect(result).toEqual(
          defineClassProvider({ provide: TestService, useClass: TestService }),
        )
      })
    })

    describe('when provider is ValueProvider', () => {
      it('should return as-is', () => {
        const valueProvider = defineValueProvider({
          provide: 'test-token',
          useValue: 'test-value',
        })
        const result = normalizeProvider(valueProvider)

        expect(result).toBe(valueProvider)
      })
    })

    describe('when provider is ClassProvider', () => {
      it('should return as-is', () => {
        const classProvider = defineClassProvider({
          provide: TestService,
          useClass: TestService,
        })
        const result = normalizeProvider(classProvider)

        expect(result).toBe(classProvider)
      })
    })

    describe('when provider is FactoryProvider', () => {
      it('should return as-is', () => {
        const factoryProvider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
        })
        const result = normalizeProvider(factoryProvider)

        expect(result).toBe(factoryProvider)
      })
    })
  })
})

import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../src/class-provider.ts'
import { defineToken } from '../src/token.ts'

class TestService {}

describe('class-provider', () => {
  describe('defineClassProvider', () => {
    describe('with InferableClassProvider', () => {
      it('should use default scope when not provided', () => {
        const provider = defineClassProvider({
          provide: 'test-token',
          useClass: TestService,
        })

        expect(provider.scope).toBe('singleton')
        expect(provider.provide).toBe('test-token')
        expect(provider.useClass).toBe(TestService)
      })

      it('should use provided scope', () => {
        const provider = defineClassProvider({
          provide: 'test-token',
          useClass: TestService,
          scope: 'transient',
        })

        expect(provider.scope).toBe('transient')
        expect(provider.provide).toBe('test-token')
        expect(provider.useClass).toBe(TestService)
      })

      it('should support singleton scope', () => {
        const provider = defineClassProvider({
          provide: 'test-token',
          useClass: TestService,
          scope: 'singleton',
        })

        expect(provider.scope).toBe('singleton')
      })

      it('should work with symbol tokens', () => {
        const symbol = Symbol('service-symbol')
        const provider = defineClassProvider({
          provide: symbol,
          useClass: TestService,
        })

        expect(provider.provide).toBe(symbol)
        expect(provider.useClass).toBe(TestService)
      })

      it('should return ClassProvider type', () => {
        const provider = defineClassProvider({
          provide: 'test-token',
          useClass: TestService,
        })

        expect(provider.provide).toBe('test-token')
        expect(provider.useClass).toBe(TestService)
        expect(provider.scope).toBe('singleton')
      })
    })

    describe('with ValidatableClassProvider', () => {
      it('should use default scope when not provided', () => {
        const provider = defineClassProvider({
          provide: TestService,
          useClass: TestService,
        })

        expect(provider.scope).toBe('singleton')
        expect(provider.provide).toBe(TestService)
        expect(provider.useClass).toBe(TestService)
      })

      it('should use provided scope', () => {
        const provider = defineClassProvider({
          provide: TestService,
          useClass: TestService,
          scope: 'transient',
        })

        expect(provider.scope).toBe('transient')
      })

      it('should support constructor as provide token', () => {
        const provider = defineClassProvider({
          provide: TestService,
          useClass: TestService,
        })

        expect(provider.provide).toBe(TestService)
      })

      it('should support TokenWithType as provide token', () => {
        const token = defineToken<TestService>('test-token')
        const provider = defineClassProvider({
          provide: token,
          useClass: TestService,
        })

        expect(provider.provide).toBe(token)
        expect(provider.useClass).toBe(TestService)
      })

      it('should support different constructor for useClass', () => {
        class BaseService {}

        class ExtendedService extends BaseService {}

        const provider = defineClassProvider({
          provide: BaseService,
          useClass: ExtendedService,
        })

        expect(provider.provide).toBe(BaseService)
        expect(BaseService.name).toBe('BaseService')
        expect(provider.useClass).toBe(ExtendedService)
        expect(ExtendedService.name).toBe('ExtendedService')
      })
    })

    describe('type inference', () => {
      it('should infer type from useClass with plain token', () => {
        const provider = defineClassProvider({
          provide: 'test-token',
          useClass: TestService,
        })

        // Type is inferred from useClass
        expect(provider.provide).toBe('test-token')
        expect(provider.useClass).toBe(TestService)
      })

      it('should infer type from constructor provide token', () => {
        const provider = defineClassProvider({
          provide: TestService,
          useClass: TestService,
        })

        // Type is inferred from the constructor
        expect(provider.provide).toBe(TestService)
        expect(provider.useClass).toBe(TestService)
      })
    })
  })
})

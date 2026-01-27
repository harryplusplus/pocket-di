import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../src/class-provider.ts'
import { defineFactoryProvider } from '../src/factory-provider.ts'
import {
  normalizeProvider,
  normalizeToken,
} from '../src/normalized-provider.ts'
import { inject } from '../src/symbols.ts'
import { type } from '../src/symbols.ts'
import { defineValueProvider } from '../src/value-provider.ts'

class TestService {
  static [inject] = { dep: 'test-dep' as any }
}

describe('normalized-provider', () => {
  describe('normalizeToken()', () => {
    it('should return string token as-is', () => {
      const token = 'my-token'
      expect(normalizeToken(token)).toBe(token)
    })

    it('should return symbol token as-is', () => {
      const token = Symbol('my-token')
      expect(normalizeToken(token)).toBe(token)
    })

    it('should extract plain token from TypedToken', () => {
      const plainToken = 'my-token'
      const typeSymbol = type
      const typedToken = { token: plainToken, [typeSymbol]: undefined as any }
      expect(normalizeToken(typedToken as any)).toBe(plainToken)
    })

    it('should return constructor token as-is', () => {
      class Service {}
      expect(normalizeToken(Service)).toBe(Service)
    })
  })

  describe('normalizeProvider()', () => {
    describe('ValueProvider', () => {
      it('should normalize value provider', () => {
        const provider = defineValueProvider({
          provide: 'my-service',
          useValue: { value: 42 },
        })

        const normalized = normalizeProvider(provider)

        expect(normalized.token).toBe('my-service')
        expect(normalized.type).toBe('value')
        expect(normalized.scope).toBe('singleton')
        expect(normalized.value).toEqual({ value: 42 })
      })
    })

    describe('ClassProvider', () => {
      it('should normalize class provider with default scope', () => {
        const provider = defineClassProvider({
          provide: 'my-service',
          useClass: TestService,
        })

        const normalized = normalizeProvider(provider)

        expect(normalized.token).toBe('my-service')
        expect(normalized.type).toBe('class')
        expect(normalized.scope).toBe('singleton')
        expect(normalized.classConstructor).toBe(TestService)
        expect(normalized.inject).toEqual({ dep: 'test-dep' })
      })

      it('should normalize class provider with transient scope', () => {
        const provider = defineClassProvider({
          provide: 'my-service',
          useClass: TestService,
          scope: 'transient',
        })

        const normalized = normalizeProvider(provider)

        expect(normalized.scope).toBe('transient')
      })

      it('should normalize class provider without inject metadata', () => {
        class SimpleService {}

        const provider = defineClassProvider({
          provide: 'simple-service',
          useClass: SimpleService,
        })

        const normalized = normalizeProvider(provider)

        expect(normalized.inject).toEqual({})
      })
    })

    describe('FactoryProvider', () => {
      it('should normalize factory provider with default options', () => {
        const factory = () => ({ value: 42 })
        const provider = defineFactoryProvider({
          provide: 'my-service',
          useFactory: factory,
        }) as any

        const normalized = normalizeProvider(provider)

        expect(normalized.token).toBe('my-service')
        expect(normalized.type).toBe('factory')
        expect(normalized.scope).toBe('singleton')
        expect(normalized.factory).toBe(factory)
        expect(normalized.inject).toEqual({})
        expect(normalized.preDestroy).toEqual(expect.any(Function))
      })

      it('should normalize factory provider with inject', () => {
        const factory = () => ({ value: 42 })
        const provider = defineFactoryProvider({
          provide: 'my-service',
          useFactory: factory,
          inject: { dep: 'test-dep' as any },
        }) as any

        const normalized = normalizeProvider(provider)

        expect(normalized.inject).toEqual({ dep: 'test-dep' })
      })

      it('should normalize factory provider with preDestroy', () => {
        const factory = () => ({ value: 42 })
        const preDestroy = () => {}
        const provider = defineFactoryProvider({
          provide: 'my-service',
          useFactory: factory,
          preDestroy,
        }) as any

        const normalized = normalizeProvider(provider)

        expect(normalized.preDestroy).toBe(preDestroy)
      })
    })

    describe('Constructor Provider', () => {
      it('should normalize constructor provider', () => {
        class Service {
          static [inject] = { dep: 'test-dep' as any }
        }

        const normalized = normalizeProvider(Service)

        expect(normalized.token).toBe(Service)
        expect(normalized.type).toBe('class')
        expect(normalized.scope).toBe('singleton')
        expect(normalized.classConstructor).toBe(Service)
        expect(normalized.inject).toEqual({ dep: 'test-dep' })
      })

      it('should normalize constructor without inject metadata', () => {
        class SimpleService {}

        const normalized = normalizeProvider(SimpleService)

        expect(normalized.token).toBe(SimpleService)
        expect(normalized.inject).toEqual({})
      })
    })
  })
})

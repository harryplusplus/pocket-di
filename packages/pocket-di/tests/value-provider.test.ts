import { describe, expect, it } from 'vitest'

import { defineValueProvider } from '../src/value-provider.ts'

class TestService {
  name = 'test'
}

const TOKEN = 'test-token'

describe('value-provider', () => {
  describe('defineValueProvider', () => {
    describe('with InferableValueProvider', () => {
      it('should return provider with plain token', () => {
        const service = new TestService()
        const provider = defineValueProvider({
          provide: TOKEN,
          useValue: service,
        })

        expect(provider.provide).toBe(TOKEN)
        expect(provider.useValue).toBe(service)
      })

      it('should work with symbol tokens', () => {
        const symbol = Symbol('service-symbol')
        const service = new TestService()
        const provider = defineValueProvider({
          provide: symbol,
          useValue: service,
        })

        expect(provider.provide).toBe(symbol)
        expect(provider.useValue).toBe(service)
      })

      it('should work with primitive values', () => {
        const provider = defineValueProvider({
          provide: 'api-url',
          useValue: 'https://api.example.com',
        })

        expect(provider.provide).toBe('api-url')
        expect(provider.useValue).toBe('https://api.example.com')
      })

      it('should work with object values', () => {
        const config = { port: 3000, host: 'localhost' }
        const provider = defineValueProvider({
          provide: 'config',
          useValue: config,
        })

        expect(provider.provide).toBe('config')
        expect(provider.useValue).toBe(config)
      })

      it('should work with number values', () => {
        const provider = defineValueProvider({
          provide: 'port',
          useValue: 8080,
        })

        expect(provider.provide).toBe('port')
        expect(provider.useValue).toBe(8080)
      })
    })

    describe('with ValidatableValueProvider', () => {
      it('should return provider with typed token', () => {
        const service = new TestService()
        const provider = defineValueProvider({
          provide: TestService,
          useValue: service,
        })

        expect(provider.provide).toBe(TestService)
        expect(provider.useValue).toBe(service)
      })

      it('should work with subclass values', () => {
        class BaseService {
          baseName = 'base'
        }

        class ExtendedService extends BaseService {
          extendedName = 'extended'
        }

        const extended = new ExtendedService()
        const provider = defineValueProvider({
          provide: BaseService,
          useValue: extended,
        })

        expect(provider.provide).toBe(BaseService)
        expect(provider.useValue).toBe(extended)
      })
    })

    describe('type inference', () => {
      it('should infer type from value', () => {
        const service = new TestService()
        const provider = defineValueProvider({
          provide: TOKEN,
          useValue: service,
        })

        // Type is inferred from useValue
        expect(provider.useValue.name).toBe('test')
      })

      it('should preserve type information from constructor token', () => {
        const service = new TestService()
        const provider = defineValueProvider({
          provide: TestService,
          useValue: service,
        })

        // Type is inferred from constructor
        expect(provider.useValue.name).toBe('test')
      })
    })
  })
})

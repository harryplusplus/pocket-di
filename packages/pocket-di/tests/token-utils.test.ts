import { describe, expect, it } from 'vitest'

import { defineToken } from '../src/token.ts'
import { tokenToString } from '../src/token-utils.ts'

class TestService {}

describe('token-utils', () => {
  describe('tokenToString', () => {
    describe('when token is string', () => {
      it('should return string as-is', () => {
        expect(tokenToString('my-token')).toBe('my-token')
      })

      it('should return empty string', () => {
        expect(tokenToString('')).toBe('')
      })
    })

    describe('when token is symbol', () => {
      it('should return Symbol(description) for symbol with description', () => {
        expect(tokenToString(Symbol('my-symbol'))).toBe('Symbol(my-symbol)')
      })

      it('should return Symbol() for symbol without description', () => {
        expect(tokenToString(Symbol())).toBe('Symbol()')
      })
    })

    describe('when token is TypedToken with string', () => {
      it('should return the inner string', () => {
        const token = defineToken<TestService>('service-token')
        expect(tokenToString(token)).toBe('service-token')
      })
    })

    describe('when token is TypedToken with symbol', () => {
      it('should return Symbol(description)', () => {
        const symbol = Symbol('service-symbol')
        const token = defineToken<TestService>(symbol)
        expect(tokenToString(token)).toBe('Symbol(service-symbol)')
      })

      it('should return Symbol() for symbol without description', () => {
        const symbol = Symbol()
        const token = defineToken<TestService>(symbol)
        expect(tokenToString(token)).toBe('Symbol()')
      })
    })

    describe('when token is InjectableConstructor', () => {
      it('should return class name', () => {
        expect(tokenToString(TestService)).toBe('TestService')
      })

      it('should return named class name', () => {
        class AnotherService {}
        expect(tokenToString(AnotherService)).toBe('AnotherService')
      })

      it('should return class.name for constructor', () => {
        // Verify it uses the name property
        class NamedService {}
        const name = tokenToString(NamedService)
        expect(name).toBe(NamedService.name)
      })
    })
  })
})

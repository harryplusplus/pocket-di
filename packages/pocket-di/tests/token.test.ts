import { describe, expect, it } from 'vitest'

import {
  defineToken,
  isConstructorToken,
  isPlainToken,
  isTypedToken,
  tokenToString,
  toKeyToken,
  type TypedToken,
} from '../src/token.ts'

class TestService {}

describe('token', () => {
  describe('isPlainToken', () => {
    it('should return true for string tokens', () => {
      expect(isPlainToken('my-token')).toBe(true)
      expect(isPlainToken('')).toBe(true)
    })

    it('should return true for symbol tokens', () => {
      const symbol = Symbol('my-symbol')
      expect(isPlainToken(symbol)).toBe(true)
      expect(isPlainToken(Symbol())).toBe(true)
    })

    it('should return false for constructor tokens', () => {
      expect(isPlainToken(TestService)).toBe(false)
    })

    it('should return false for object tokens', () => {
      const token = defineToken<TestService>('my-token')
      expect(isPlainToken(token)).toBe(false)
    })
  })

  describe('defineToken', () => {
    it('should create token with type from string', () => {
      const token = defineToken<TestService>('service-token')

      expect(token.token).toBe('service-token')
    })

    it('should create token with type from symbol', () => {
      const symbol = Symbol('service-symbol')
      const token = defineToken<TestService>(symbol)

      expect(token.token).toBe(symbol)
    })

    it('should preserve type information', () => {
      const token = defineToken<TestService>('test-token')

      // Type assertion to verify type is preserved
      const typed: TypedToken<TestService> = token
      expect(typed.token).toBe('test-token')
    })
  })

  describe('isTypedToken', () => {
    it('should return true for token with type symbol', () => {
      const token = defineToken<TestService>('test-token')
      expect(isTypedToken(token)).toBe(true)
    })

    it('should return false for string tokens', () => {
      expect(isTypedToken('my-token')).toBe(false)
    })

    it('should return false for symbol tokens', () => {
      expect(isTypedToken(Symbol('my-symbol'))).toBe(false)
    })

    it('should return false for constructor tokens', () => {
      expect(isTypedToken(TestService)).toBe(false)
    })

    it('should return false for plain objects', () => {
      expect(isTypedToken({} as any)).toBe(false)
      expect(isTypedToken({ token: 'test' } as any)).toBe(false)
    })

    it('should return false for objects without type symbol', () => {
      const obj = { token: 'test', other: 'value' }
      expect(isTypedToken(obj as any)).toBe(false)
    })
  })

  describe('isConstructorToken', () => {
    it('should return true for constructor functions', () => {
      expect(isConstructorToken(TestService)).toBe(true)

      class AnotherService {}
      expect(isConstructorToken(AnotherService)).toBe(true)
    })

    it('should return false for string tokens', () => {
      expect(isConstructorToken('my-token')).toBe(false)
    })

    it('should return false for symbol tokens', () => {
      expect(isConstructorToken(Symbol('my-symbol'))).toBe(false)
    })

    it('should return false for object tokens', () => {
      const token = defineToken<TestService>('test-token')
      expect(isConstructorToken(token)).toBe(false)
    })

    it('should return false for objects', () => {
      expect(isConstructorToken({} as any)).toBe(false)
    })

    it('should return false for null and undefined', () => {
      expect(isConstructorToken(null as any)).toBe(false)
      expect(isConstructorToken(undefined as any)).toBe(false)
    })
  })

  describe('toKeyToken', () => {
    it('should return string as-is for PlainToken string', () => {
      expect(toKeyToken('my-token')).toBe('my-token')
    })

    it('should return symbol as-is for PlainToken symbol', () => {
      const symbol = Symbol('my-symbol')
      expect(toKeyToken(symbol)).toBe(symbol)
    })

    it('should extract inner token from TypedToken with string', () => {
      const token = defineToken<TestService>('service-token')
      expect(toKeyToken(token)).toBe('service-token')
    })

    it('should extract inner token from TypedToken with symbol', () => {
      const symbol = Symbol('service-symbol')
      const token = defineToken<TestService>(symbol)
      expect(toKeyToken(token)).toBe(symbol)
    })

    it('should return constructor as-is for InjectableConstructor', () => {
      expect(toKeyToken(TestService)).toBe(TestService)
    })
  })

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

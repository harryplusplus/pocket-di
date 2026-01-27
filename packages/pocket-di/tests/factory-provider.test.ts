import { describe, expect, it } from 'vitest'

import { defineFactoryProvider } from '../src/factory-provider.ts'
import { tokenWithType } from '../src/token.ts'

class TestService {}

class DepService {}

describe('factory-provider', () => {
  describe('defineFactoryProvider', () => {
    describe('with InferableSingletonFactoryProvider', () => {
      it('should use default scope when not provided', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
        })

        expect(provider.scope).toBe('singleton')
        expect(provider.provide).toBe('test-token')
        expect(provider.useFactory).toBe(factory)
      })

      it('should use provided singleton scope', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
          scope: 'singleton',
        })

        expect(provider.scope).toBe('singleton')
      })

      it('should use default preDestroy when not provided', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
        })

        expect(provider.preDestroy).toBeInstanceOf(Function)
        expect(provider.preDestroy(new TestService())).toBeUndefined()
      })

      it('should use provided preDestroy', () => {
        let destroyed = false
        const factory = () => new TestService()
        const preDestroy = (_instance: TestService) => {
          destroyed = true
        }

        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
          preDestroy,
        })

        expect(provider.preDestroy).toBe(preDestroy)

        const instance = new TestService()
        void provider.preDestroy(instance)
        expect(destroyed).toBe(true)
      })

      it('should use default inject when not provided', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
        })

        expect(provider.inject).toEqual({})
      })

      it('should use provided inject', () => {
        const factory = (_deps: { dep: DepService }) => new TestService()
        const inject = { dep: tokenWithType<DepService>('dep-token') }

        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
          inject,
        })

        expect(provider.inject).toBe(inject)
      })
    })

    describe('with InferableTransientFactoryProvider', () => {
      it('should use transient scope', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
          scope: 'transient',
        })

        expect(provider.scope).toBe('transient')
      })

      it('should use default preDestroy for transient', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
          scope: 'transient',
        })

        expect(provider.preDestroy).toBeInstanceOf(Function)
      })

      it('should work with dependencies', () => {
        const factory = (_deps: { dep: DepService }) => new TestService()
        const inject = { dep: tokenWithType<DepService>('dep-token') }

        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
          scope: 'transient',
          inject,
        })

        expect(provider.scope).toBe('transient')
        expect(provider.inject).toBe(inject)
      })
    })

    describe('with ValidatableSingletonFactoryProvider', () => {
      it('should work with constructor as provide token', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: factory,
        })

        expect(provider.provide).toBe(TestService)
        expect(provider.scope).toBe('singleton')
      })

      it('should work with TokenWithType as provide token', () => {
        const factory = () => new TestService()
        const token = tokenWithType<TestService>('test-token')
        const provider = defineFactoryProvider({
          provide: token,
          useFactory: factory,
        })

        expect(provider.provide).toBe(token)
        expect(provider.scope).toBe('singleton')
      })

      it('should work with subclass return type', () => {
        class BaseService {}

        class ExtendedService extends BaseService {}

        const factory = () => new ExtendedService()
        const provider = defineFactoryProvider({
          provide: BaseService,
          useFactory: factory,
        })

        expect(provider.provide).toBe(BaseService)
        expect((BaseService as any).name).toBe('BaseService')
      })

      it('should support all options', () => {
        const factory = (_deps: { dep: DepService }) => new TestService()
        const inject = { dep: tokenWithType<DepService>('dep-token') }
        const preDestroy = (_instance: TestService) => {
          // noop for testing
        }

        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: factory,
          scope: 'singleton',
          inject,
          preDestroy,
        })

        expect(provider.provide).toBe(TestService)
        expect(provider.scope).toBe('singleton')
        expect(provider.inject).toBe(inject)
        expect(provider.preDestroy).toBe(preDestroy)
      })
    })

    describe('with ValidatableTransientFactoryProvider', () => {
      it('should work with transient scope', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: factory,
          scope: 'transient',
        })

        expect(provider.scope).toBe('transient')
      })

      it('should work with TokenWithType as provide token', () => {
        const factory = () => new TestService()
        const token = tokenWithType<TestService>('test-token')
        const provider = defineFactoryProvider({
          provide: token,
          useFactory: factory,
          scope: 'transient',
        })

        expect(provider.provide).toBe(token)
        expect(provider.scope).toBe('transient')
      })

      it('should work with dependencies', () => {
        const factory = (_deps: { dep: DepService }) => new TestService()
        const inject = { dep: tokenWithType<DepService>('dep-token') }

        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: factory,
          scope: 'transient',
          inject,
        })

        expect(provider.inject).toBe(inject)
      })
    })

    describe('factory function types', () => {
      it('should support synchronous factory', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
        })

        const result = provider.useFactory({} as never)
        expect(result).toBeInstanceOf(TestService)

        expect((TestService as any).name).toBe('TestService')
      })

      it('should support asynchronous factory', async () => {
        const factory = async () => {
          await Promise.resolve()
          return new TestService()
        }

        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
        })

        const result = await provider.useFactory({} as never)
        expect(result).toBeInstanceOf(TestService)

        expect((TestService as any).name).toBe('TestService')
      })

      it('should support async preDestroy', async () => {
        let destroyed = false
        const factory = () => new TestService()
        const preDestroy = async (_instance: TestService) => {
          await Promise.resolve()
          destroyed = true
        }

        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
          preDestroy,
        })

        await provider.preDestroy(new TestService())
        expect(destroyed).toBe(true)
      })
    })

    describe('type inference', () => {
      it('should infer type from factory return type with plain token', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: factory,
        })

        // Type is inferred from factory
        expect(provider.useFactory).toBe(factory)
      })

      it('should infer type from provide token', () => {
        const factory = () => new TestService()
        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: factory,
        })

        expect(provider.provide).toBe(TestService)
      })
    })
  })
})

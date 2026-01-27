import { describe, expect, it } from 'vitest'

import { defineFactoryProvider } from '../src/factory-provider.ts'
import { defineToken } from '../src/token.ts'

class TestService {}

class DepService {}

describe('factory-provider', () => {
  describe('defineFactoryProvider', () => {
    describe('with InferableSingletonFactoryProvider', () => {
      it('should use default scope when not provided', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
        })

        expect(provider.scope).toBe('singleton')
        expect(provider.provide).toBe('test-token')
        expect(provider.useFactory).toBeInstanceOf(Function)
      })

      it('should use provided singleton scope', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
          scope: 'singleton',
        })

        expect(provider.scope).toBe('singleton')
      })

      it('should use default preDestroy when not provided', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
        })

        expect(provider.preDestroy).toBeInstanceOf(Function)
        expect(provider.preDestroy(new TestService())).toBeUndefined()
      })

      it('should use provided preDestroy', () => {
        let destroyed = false

        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
          preDestroy: (_instance: TestService) => {
            destroyed = true
          },
        })

        expect(provider.preDestroy).toBeInstanceOf(Function)

        const instance = new TestService()
        void provider.preDestroy(instance)
        expect(destroyed).toBe(true)
      })

      it('should use default inject when not provided', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
        })

        expect(provider.inject).toEqual({})
      })

      it('should use provided inject', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: (_deps: { dep: DepService }) => new TestService(),
          inject: { dep: defineToken<DepService>('dep-token') },
        })

        expect(provider.inject).toHaveProperty('dep')
        expect(provider.inject.dep.token).toBe('dep-token')
      })
    })

    describe('with InferableTransientFactoryProvider', () => {
      it('should use transient scope', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
          scope: 'transient',
        })

        expect(provider.scope).toBe('transient')
      })

      it('should use default preDestroy for transient', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
          scope: 'transient',
        })

        expect(provider.preDestroy).toBeInstanceOf(Function)
      })

      it('should work with dependencies', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: (_deps: { dep: DepService }) => new TestService(),
          scope: 'transient',
          inject: { dep: defineToken<DepService>('dep-token') },
        })

        expect(provider.scope).toBe('transient')
        expect(provider.inject).toHaveProperty('dep')
        expect(provider.inject.dep.token).toBe('dep-token')
      })
    })

    describe('with ValidatableSingletonFactoryProvider', () => {
      it('should work with constructor as provide token', () => {
        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: () => new TestService(),
        })

        expect(provider.provide).toBe(TestService)
        expect(provider.scope).toBe('singleton')
      })

      it('should work with TokenWithType as provide token', () => {
        const token = defineToken<TestService>('test-token')
        const provider = defineFactoryProvider({
          provide: token,
          useFactory: () => new TestService(),
        })

        expect(provider.provide).toBe(token)
        expect(provider.scope).toBe('singleton')
      })

      it('should work with subclass return type', () => {
        class BaseService {}

        class ExtendedService extends BaseService {}

        const provider = defineFactoryProvider({
          provide: BaseService,
          useFactory: () => new ExtendedService(),
        })

        expect(provider.provide).toBe(BaseService)
        expect((BaseService as any).name).toBe('BaseService')
      })

      it('should support all options', () => {
        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: (_deps: { dep: DepService }) => new TestService(),
          scope: 'singleton',
          inject: { dep: defineToken<DepService>('dep-token') },
          preDestroy: (_instance: TestService) => {
            // noop for testing
          },
        })

        expect(provider.provide).toBe(TestService)
        expect(provider.scope).toBe('singleton')
        expect(provider.inject).toHaveProperty('dep')
        expect(provider.inject.dep.token).toBe('dep-token')
        expect(provider.preDestroy).toBeInstanceOf(Function)
      })
    })

    describe('with ValidatableTransientFactoryProvider', () => {
      it('should work with transient scope', () => {
        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: () => new TestService(),
          scope: 'transient',
        })

        expect(provider.scope).toBe('transient')
      })

      it('should work with TokenWithType as provide token', () => {
        const token = defineToken<TestService>('test-token')
        const provider = defineFactoryProvider({
          provide: token,
          useFactory: () => new TestService(),
          scope: 'transient',
        })

        expect(provider.provide).toBe(token)
        expect(provider.scope).toBe('transient')
      })

      it('should work with dependencies', () => {
        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: (_deps: { dep: DepService }) => new TestService(),
          scope: 'transient',
          inject: { dep: defineToken<DepService>('dep-token') },
        })

        expect(provider.inject).toHaveProperty('dep')
        expect(provider.inject.dep.token).toBe('dep-token')
      })
    })

    describe('factory function types', () => {
      it('should support synchronous factory', () => {
        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
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
        const preDestroy = async (_instance: TestService) => {
          await Promise.resolve()
          destroyed = true
        }

        const provider = defineFactoryProvider({
          provide: 'test-token',
          useFactory: () => new TestService(),
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
        const provider = defineFactoryProvider({
          provide: TestService,
          useFactory: () => new TestService(),
        })

        expect(provider.provide).toBe(TestService)
      })
    })
  })
})

import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../src/class-provider.ts'
import { ContainerInitializer } from '../src/container-initializer.ts'
import { defineFactoryProvider } from '../src/factory-provider.ts'
import { inject } from '../src/symbols.ts'
import { defineValueProvider } from '../src/value-provider.ts'

class ServiceA {
  static [inject] = { serviceB: 'ServiceB' as any }
}

class ServiceB {
  static [inject] = {}
}

class CircularA {
  static [inject] = { circularB: 'CircularB' as any }
}

class CircularB {
  static [inject] = { circularA: 'CircularA' as any }
}

describe('container-initializer', () => {
  describe('context creation', () => {
    it('should create context with parent reference', () => {
      const parent = { context: { children: new Set() } } as any
      const initializer = new ContainerInitializer(null as any, {
        providers: [],
        parent,
      })

      const context = initializer.initialize()

      expect(context.parent).toBe(parent)
      expect(context.children).toBeInstanceOf(Set)
      expect(context.children.size).toBe(0)
      expect(context.providerMap).toBeInstanceOf(Map)
      expect(context.providerMap.size).toBe(0)
    })

    it('should create context without parent', () => {
      const initializer = new ContainerInitializer(null as any, {
        providers: [],
      })

      const context = initializer.initialize()

      expect(context.parent).toBeUndefined()
    })

    it('should register container with parent', () => {
      const container = {} as any
      const parent = { context: { children: new Set() } } as any

      const initializer = new ContainerInitializer(container, {
        providers: [],
        parent,
      })

      initializer.initialize()

      expect(parent.context.children.has(container)).toBe(true)
    })
  })

  describe('provider registration', () => {
    it('should register value provider', () => {
      const provider = defineValueProvider({
        provide: 'my-service',
        useValue: { value: 42 },
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [provider],
      })

      const context = initializer.initialize()

      expect(context.providerMap.has('my-service')).toBe(true)
      const normalized = context.providerMap.get('my-service')
      expect(normalized?.type).toBe('value')
    })

    it('should register class provider', () => {
      const providerB = defineClassProvider({
        provide: 'ServiceB',
        useClass: ServiceB,
      })
      const providerA = defineClassProvider({
        provide: 'my-service',
        useClass: ServiceA,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [providerB, providerA],
      })

      const context = initializer.initialize()

      expect(context.providerMap.has('my-service')).toBe(true)
      const normalized = context.providerMap.get('my-service')
      expect(normalized?.type).toBe('class')
      expect(normalized?.classConstructor).toBe(ServiceA)
    })

    it('should register factory provider', () => {
      const factory = () => ({ value: 42 })
      const provider = defineFactoryProvider({
        provide: 'my-service',
        useFactory: factory,
      }) as any

      const initializer = new ContainerInitializer(null as any, {
        providers: [provider],
      })

      const context = initializer.initialize()

      expect(context.providerMap.has('my-service')).toBe(true)
      const normalized = context.providerMap.get('my-service')
      expect(normalized?.type).toBe('factory')
      expect(normalized?.factory).toBe(factory)
    })

    it('should register constructor provider', () => {
      const initializer = new ContainerInitializer(null as any, {
        providers: [ServiceB],
      })

      const context = initializer.initialize()

      expect(context.providerMap.has(ServiceB)).toBe(true)
      const normalized = context.providerMap.get(ServiceB)
      expect(normalized?.type).toBe('class')
    })
  })

  describe('token uniqueness validation', () => {
    it('should throw when registering duplicate token in same container', () => {
      const provider1 = defineValueProvider({
        provide: 'my-service',
        useValue: 1,
      })
      const provider2 = defineValueProvider({
        provide: 'my-service',
        useValue: 2,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [provider1, provider2],
      })

      expect(() => initializer.initialize()).toThrow(
        'Cannot register token "my-service": already registered in this container.',
      )
    })

    it('should throw when token exists in parent container', () => {
      const parentProvider = defineValueProvider({
        provide: 'my-service',
        useValue: 1,
      })

      const parent = {
        context: {
          children: new Set(),
          providerMap: new Map([['my-service', parentProvider as any]]),
        },
      } as any

      const childProvider = defineValueProvider({
        provide: 'my-service',
        useValue: 2,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [childProvider],
        parent,
      })

      expect(() => initializer.initialize()).toThrow(
        'Cannot register token "my-service": already exists in parent container.',
      )
    })
  })

  describe('dependency validation', () => {
    it('should validate valid dependencies', () => {
      const providerB = defineClassProvider({
        provide: 'ServiceB',
        useClass: ServiceB,
      })
      const providerA = defineClassProvider({
        provide: 'ServiceA',
        useClass: ServiceA,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [providerB, providerA],
      })

      expect(() => initializer.initialize()).not.toThrow()
    })

    it('should throw for unregistered dependency', () => {
      class ServiceC {
        static [inject] = { serviceD: 'ServiceD' as any }
      }

      const provider = defineClassProvider({
        provide: 'ServiceC',
        useClass: ServiceC,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [provider],
      })

      expect(() => initializer.initialize()).toThrow(
        'Cannot register provider "ServiceC": dependency "ServiceD" is not registered.',
      )
    })

    it('should throw for invalid dependency name: empty string', () => {
      class ServiceInvalid {
        static [inject] = { '': 'ServiceB' as any }
      }

      const provider = defineClassProvider({
        provide: 'ServiceInvalid',
        useClass: ServiceInvalid,
      })
      const providerB = defineClassProvider({
        provide: 'ServiceB',
        useClass: ServiceB,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [providerB, provider],
      })

      expect(() => initializer.initialize()).toThrow(
        'Cannot register provider "ServiceInvalid": invalid dependency name "".',
      )
    })

    it('should throw for invalid dependency name: constructor', () => {
      class ServiceInvalid {
        static [inject] = { constructor: 'ServiceB' as any }
      }

      const provider = defineClassProvider({
        provide: 'ServiceInvalid',
        useClass: ServiceInvalid,
      })
      const providerB = defineClassProvider({
        provide: 'ServiceB',
        useClass: ServiceB,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [providerB, provider],
      })

      expect(() => initializer.initialize()).toThrow(
        'Cannot register provider "ServiceInvalid": invalid dependency name "constructor".',
      )
    })

    it('should throw for invalid dependency name: prototype', () => {
      class ServiceInvalid {
        static [inject] = { prototype: 'ServiceB' as any }
      }

      const provider = defineClassProvider({
        provide: 'ServiceInvalid',
        useClass: ServiceInvalid,
      })
      const providerB = defineClassProvider({
        provide: 'ServiceB',
        useClass: ServiceB,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [providerB, provider],
      })

      expect(() => initializer.initialize()).toThrow(
        'Cannot register provider "ServiceInvalid": invalid dependency name "prototype".',
      )
    })

    it('should throw for circular dependencies', () => {
      const providerA = defineClassProvider({
        provide: 'CircularA',
        useClass: CircularA,
      })
      const providerB = defineClassProvider({
        provide: 'CircularB',
        useClass: CircularB,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [providerA, providerB],
      })

      expect(() => initializer.initialize()).toThrow(
        'Circular dependency detected',
      )
    })

    it('should find dependency in parent container', () => {
      const parentProvider = defineClassProvider({
        provide: 'ServiceB',
        useClass: ServiceB,
      })

      const parent = {
        context: {
          children: new Set(),
          providerMap: new Map([['ServiceB', parentProvider as any]]),
        },
      } as any

      const providerA = defineClassProvider({
        provide: 'ServiceA',
        useClass: ServiceA,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [providerA],
        parent,
      })

      expect(() => initializer.initialize()).not.toThrow()
    })

    it('should search through parent chain for dependency', () => {
      const grandParentProvider = defineClassProvider({
        provide: 'ServiceB',
        useClass: ServiceB,
      })

      const grandParent = {
        context: {
          children: new Set(),
          providerMap: new Map([['ServiceB', grandParentProvider as any]]),
        },
      } as any

      const parent = {
        context: {
          children: new Set(),
          providerMap: new Map(),
          parent: grandParent,
        },
      } as any

      const providerA = defineClassProvider({
        provide: 'ServiceA',
        useClass: ServiceA,
      })

      const initializer = new ContainerInitializer(null as any, {
        providers: [providerA],
        parent,
      })

      expect(() => initializer.initialize()).not.toThrow()
    })
  })
})

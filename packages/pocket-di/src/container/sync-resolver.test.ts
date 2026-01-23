// packages/pocket-di/src/container/sync-resolver.test.ts
import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../types/class-provider.ts'
import { defineFactoryProvider } from '../types/factory-provider.ts'
import { inject, postConstruct } from '../types/symbols.ts'
import { createContainer } from './proxy.ts'

describe('sync-resolver - postConstruct async error', () => {
  it('should throw error when class postConstruct returns Promise', () => {
    class Service {
      async [postConstruct]() {
        await Promise.resolve()
      }
    }

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
    })

    const container = createContainer({ providers: [serviceProvider] })

    expect(() => container.service.resolveSync()).toThrow(
      'Cannot resolve "service" (Service) synchronously: postConstruct returns Promise.',
    )
  })
})

describe('sync-resolver - factory async error', () => {
  it('should throw error when factory returns Promise', () => {
    const factoryProvider = defineFactoryProvider({
      provide: 'service',
      useFactory: async () => {
        await Promise.resolve()
        return { value: 42 }
      },
    })

    const container = createContainer({ providers: [factoryProvider] })

    expect(() => container.service.resolveSync()).toThrow(
      'Cannot resolve "service" synchronously: useFactory returns Promise.',
    )
  })
})

describe('sync-resolver - basic resolution', () => {
  it('should resolve simple class without dependencies', () => {
    class Service {
      value = 42
      constructor(_deps: object) {}
    }

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
    })

    const container = createContainer({ providers: [serviceProvider] })

    const instance = container.service.resolveSync()

    expect(instance).toBeInstanceOf(Service)
    expect(instance.value).toBe(42)
  })
})

describe('sync-resolver - factory with dependencies', () => {
  it('should resolve factory dependencies', () => {
    class ServiceA {
      value = 42
    }

    const serviceAProvider = defineClassProvider({
      provide: 'serviceA',
      useClass: ServiceA,
    })

    const serviceBProvider = defineFactoryProvider({
      provide: 'serviceB',
      useFactory: ({ serviceA }: { serviceA: ServiceA }) => {
        return { doubled: serviceA.value * 2 }
      },
      inject: { serviceA: { key: 'serviceA' } },
    })

    const container = createContainer({
      providers: [serviceAProvider, serviceBProvider],
    })

    const instance = container.serviceB.resolveSync()

    expect(instance.doubled).toBe(84)
  })
})

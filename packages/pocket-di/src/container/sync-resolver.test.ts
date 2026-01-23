// packages/pocket-di/src/container/sync-resolver.test.ts
import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../types/class-provider.ts'
import { defineFactoryProvider } from '../types/factory-provider.ts'
import { inject, postConstruct } from '../types/symbols.ts'
import { token } from '../types/token.ts'
import { createContainer } from './proxy.ts'

describe('sync-resolver - postConstruct', () => {
  it('should handle sync postConstruct successfully', () => {
    class Service {
      initialized = false

      constructor(_deps: object) {}

      [postConstruct]() {
        this.initialized = true
      }
    }

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: 'service', useClass: Service }),
      ],
    })

    const instance = container.service.resolveSync()

    expect(instance).toBeInstanceOf(Service)
    expect(instance.initialized).toBe(true)
  })

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

describe('sync-resolver - dependencies', () => {
  it('should resolve class with dependencies using inject symbol', () => {
    class ServiceA {
      value = 42
      constructor(_deps: object) {}
    }

    const serviceAToken = token<ServiceA>()('serviceA')

    class ServiceB {
      static [inject] = { serviceA: serviceAToken }
      doubled: number

      constructor({ serviceA }: { serviceA: ServiceA }) {
        this.doubled = serviceA.value * 2
      }
    }

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: serviceAToken, useClass: ServiceA }),
        defineClassProvider({ provide: 'serviceB', useClass: ServiceB }),
      ],
    })

    const instance = container.serviceB.resolveSync()

    expect(instance.doubled).toBe(84)
  })

  it('should resolve factory with token-based dependencies', () => {
    class ServiceA {
      value = 42
      constructor(_deps: object) {}
    }

    const serviceAToken = token<ServiceA>()('serviceA')

    const serviceBProvider = defineFactoryProvider({
      provide: 'serviceB',
      useFactory: ({ serviceA }: { serviceA: ServiceA }) => {
        return { doubled: serviceA.value * 2 }
      },
      inject: { serviceA: serviceAToken },
    })

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: serviceAToken, useClass: ServiceA }),
        serviceBProvider,
      ],
    })

    const instance = container.serviceB.resolveSync()

    expect(instance.doubled).toBe(84)
  })
})

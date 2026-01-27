// packages/pocket-di/src/container/destroyer.test.ts
import { describe, expect, it } from 'vitest'

import { defineClassProvider } from '../types/class-provider.ts'
import { defineFactoryProvider } from '../types/factory-provider.ts'
import { preDestroy } from '../types/symbols.ts'
import { createContainer } from './proxy.ts'

describe('destroyer - class preDestroy error', () => {
  it('should handle class preDestroy error gracefully', async () => {
    class Service {
      async [preDestroy]() {
        await Promise.resolve()
        throw new Error('preDestroy error')
      }
    }

    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: Service,
    })

    const container = createContainer({ providers: [serviceProvider] })
    await container.service.resolve()

    await expect(container.$destroy()).resolves.not.toThrow()
  })
})

describe('destroyer - factory preDestroy error', () => {
  it('should handle sync factory preDestroy error', async () => {
    const factoryProvider = defineFactoryProvider({
      provide: 'service',
      useFactory: () => ({ value: 42 }),
      preDestroy: () => {
        throw new Error('sync factory preDestroy error')
      },
    })

    const container = createContainer({ providers: [factoryProvider] })
    await container.service.resolve()

    await expect(container.$destroy()).resolves.not.toThrow()
  })

  it('should handle async factory preDestroy error', async () => {
    const factoryProvider = defineFactoryProvider({
      provide: 'service',
      useFactory: () => ({ value: 42 }),
      preDestroy: async () => {
        await Promise.resolve()
        throw new Error('async factory preDestroy error')
      },
    })

    const container = createContainer({ providers: [factoryProvider] })
    await container.service.resolve()

    await expect(container.$destroy()).resolves.not.toThrow()
  })
})

describe('destroyer - multiple services error', () => {
  it('should continue destroying other services after error', async () => {
    let secondDestroyed = false

    class FirstService {
      async [preDestroy]() {
        await Promise.resolve()
        throw new Error('First service error')
      }
    }

    class SecondService {
      [preDestroy]() {
        secondDestroyed = true
      }
    }

    const firstProvider = defineClassProvider({
      provide: 'first',
      useClass: FirstService,
    })

    const secondProvider = defineClassProvider({
      provide: 'second',
      useClass: SecondService,
    })

    const container = createContainer({
      providers: [firstProvider, secondProvider],
    })

    await container.first.resolve()
    await container.second.resolve()
    await container.$destroy()

    expect(secondDestroyed).toBe(true)
  })
})

describe('destroyer - internal error', () => {
  it('should throw if provider not found during cleanup', async () => {
    const serviceProvider = defineClassProvider({
      provide: 'service',
      useClass: class Service {},
    })

    const container = createContainer({ providers: [serviceProvider] })
    await container.service.resolve()

    // Corrupt the provider registry
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const impl = container as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    impl.$context.providerRegistry.clear()

    await expect(container.$destroy()).rejects.toThrow(
      'Internal error: provider for key "service" not found during cleanup.',
    )
  })
})

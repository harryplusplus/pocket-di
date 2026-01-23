// packages/pocket-di/src/types/factory-provider.test.ts
import { describe, expect, it } from 'vitest'

import { createContainer } from '../container/proxy.ts'
import { defineClassProvider } from './class-provider.ts'
import { defineFactoryProvider } from './factory-provider.ts'
import { token } from './token.ts'

describe('factory-provider - transient scope', () => {
  it('should create transient factory with plain string', async () => {
    const provider = defineFactoryProvider({
      provide: 'service',
      useFactory: () => ({ value: 42 }),
      scope: 'transient',
    })

    const container = createContainer({ providers: [provider] })
    const instance1 = await container.service.resolve()
    const instance2 = await container.service.resolve()

    expect(instance1).not.toBe(instance2)
    expect(instance1.value).toBe(42)
    expect(instance2.value).toBe(42)

    await container.$destroy()
  })

  it('should create transient factory with typed token', async () => {
    interface Service {
      value: number
    }

    const SERVICE = token<Service>()('service')

    const provider = defineFactoryProvider({
      provide: SERVICE,
      useFactory: () => ({ value: 42 }),
      scope: 'transient',
    })

    const container = createContainer({ providers: [provider] })
    const instance1 = await container.service.resolve()
    const instance2 = await container.service.resolve()

    expect(instance1).not.toBe(instance2)
    expect(instance1.value).toBe(42)

    await container.$destroy()
  })
})

describe('factory-provider - with dependencies', () => {
  it('should handle factory with inject dependencies', async () => {
    class Dependency {
      getValue() {
        return 'dep'
      }
    }

    const provider = defineFactoryProvider({
      provide: 'service',
      inject: { dep: token<Dependency>()('dep') },
      useFactory: ({ dep }) => ({ value: dep.getValue() }),
    })

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: 'dep', useClass: Dependency }),
        provider,
      ],
    })
    const instance = await container.service.resolve()

    expect(instance.value).toBe('dep')

    await container.$destroy()
  })

  it('should handle async factory with dependencies', async () => {
    class Dependency {
      async getValue() {
        await Promise.resolve()
        return 'async-dep'
      }
    }

    const provider = defineFactoryProvider({
      provide: 'service',
      inject: { dep: token<Dependency>()('dep') },
      useFactory: async ({ dep }) => ({ value: await dep.getValue() }),
    })

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: 'dep', useClass: Dependency }),
        provider,
      ],
    })
    const instance = await container.service.resolve()

    expect(instance.value).toBe('async-dep')

    await container.$destroy()
  })
})

describe('factory-provider - preDestroy', () => {
  it('should call preDestroy on container destroy', async () => {
    let destroyed = false

    const provider = defineFactoryProvider({
      provide: 'service',
      useFactory: () => ({ value: 42 }),
      preDestroy: () => {
        destroyed = true
      },
    })

    const container = createContainer({ providers: [provider] })
    await container.service.resolve()
    await container.$destroy()

    expect(destroyed).toBe(true)
  })

  it('should handle async preDestroy', async () => {
    let destroyed = false

    const provider = defineFactoryProvider({
      provide: 'service',
      useFactory: () => ({ value: 42 }),
      preDestroy: async () => {
        await Promise.resolve()
        destroyed = true
      },
    })

    const container = createContainer({ providers: [provider] })
    await container.service.resolve()
    await container.$destroy()

    expect(destroyed).toBe(true)
  })
})

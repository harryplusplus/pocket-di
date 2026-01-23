import { describe, expect, it } from 'vitest'

import { createContainer } from '../container/proxy.ts'
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

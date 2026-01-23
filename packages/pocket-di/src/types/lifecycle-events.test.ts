import { describe, expect, it } from 'vitest'

import { createContainer } from '../container/proxy.ts'
import { defineClassProvider } from './class-provider.ts'
import type { InferCP } from './dependency-declaration.ts'
import { inject, postConstruct, preDestroy } from './symbols.ts'
import { token } from './token.ts'

describe('lifecycle-events - PostConstructable', () => {
  it('should identify PostConstructable', async () => {
    class Service {
      initialized = false;

      [postConstruct]() {
        this.initialized = true
      }
    }

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: 'service', useClass: Service }),
      ],
    })
    const service = await container.service.resolve()
    expect(service.initialized).toBe(true)
    await container.$destroy()
  })

  it('should handle async postConstruct', async () => {
    class Service {
      value = 0

      async [postConstruct]() {
        await Promise.resolve()
        this.value = 42
      }
    }

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: 'service', useClass: Service }),
      ],
    })
    const service = await container.service.resolve()
    expect(service.value).toBe(42)
    await container.$destroy()
  })
})

describe('lifecycle-events - PreDestroyable', () => {
  it('should identify PreDestroyable', async () => {
    let cleaned = false

    class Service {
      [preDestroy]() {
        cleaned = true
      }
    }

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: 'service', useClass: Service }),
      ],
    })
    await container.service.resolve()
    await container.$destroy()
    expect(cleaned).toBe(true)
  })

  it('should handle async preDestroy', async () => {
    let value = 0

    class Service {
      async [preDestroy]() {
        await Promise.resolve()
        value = 99
      }
    }

    const container = createContainer({
      providers: [
        defineClassProvider({ provide: 'service', useClass: Service }),
      ],
    })
    await container.service.resolve()
    await container.$destroy()
    expect(value).toBe(99)
  })
})

class OrderServiceA {
  [postConstruct]() {
    order.push('A-post')
  }

  [preDestroy]() {
    order.push('A-pre')
  }
}

const aToken = token<OrderServiceA>()('orderServiceA')

class OrderServiceB {
  static [inject] = { a: aToken }

  constructor(_deps: InferCP<typeof OrderServiceB>) {}

  [postConstruct]() {
    order.push('B-post')
  }

  [preDestroy]() {
    order.push('B-pre')
  }
}

let order: string[] = []

describe('lifecycle-events - execution order', () => {
  it('should call lifecycle hooks in correct order', async () => {
    order = []
    const container = createContainer({
      providers: [
        defineClassProvider({ provide: aToken, useClass: OrderServiceA }),
        defineClassProvider({
          provide: 'orderServiceB',
          useClass: OrderServiceB,
        }),
      ],
    })
    await container.orderServiceB.resolve()
    await container.$destroy()
    expect(order).toEqual(['A-post', 'B-post', 'B-pre', 'A-pre'])
  })
})

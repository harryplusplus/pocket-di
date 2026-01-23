import { describe, expect, it } from 'vitest'

import { createContainer, defineValueProvider } from '../src/index.ts'

describe('value provider', () => {
  it('should to create container', async () => {
    const aValueProvider = defineValueProvider({ provide: 'a', useValue: 'a' })
    const container = createContainer({ providers: [aValueProvider] })
    await container.$destroy()
  })

  it('should override value', async () => {
    const aValueProvider = defineValueProvider({ provide: 'a', useValue: 'a' })
    const container = createContainer({ providers: [aValueProvider] })

    const overrideAValueProvider = defineValueProvider({
      provide: aValueProvider.token,
      useValue: 'b',
    })
    const childContainer = container.$createChild({
      providers: [overrideAValueProvider],
      override: true,
    })

    const a = await childContainer.a.resolve()
    expect(a).toBe('b')

    await container.$destroy()
  })
})

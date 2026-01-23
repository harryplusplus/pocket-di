import { describe, expect, it } from 'vitest'

import { createContainer, defineValueProvider } from '../src/index.ts'

describe('already exists', () => {
  it('should not throw', async () => {
    const aValueProvider = defineValueProvider({ provide: 'a', useValue: 'a' })
    const container = createContainer({ providers: [aValueProvider] })
    await container.$destroy()
  })

  it('should throw if key already exists', () => {
    const aValueProvider = defineValueProvider({ provide: 'a', useValue: 'a' })
    const sameAValueProvider = defineValueProvider({
      provide: 'a',
      useValue: 'a',
    })
    expect(() => {
      createContainer({ providers: [aValueProvider, sameAValueProvider] })
    }).toThrow('Cannot register key "a": already exists.')
  })

  it('should throw if key already exists in parent container', () => {
    const aValueProvider = defineValueProvider({ provide: 'a', useValue: 'a' })
    const container = createContainer({ providers: [aValueProvider] })

    const sameAValueProvider = defineValueProvider({
      provide: 'a',
      useValue: 'a',
    })
    expect(() => {
      container.$createChild({ providers: [sameAValueProvider] })
    }).toThrow(
      'Cannot register key "a": already exists in parent container. Use override option to replace.',
    )
  })

  it('should not throw if key already exists in parent container', async () => {
    const aValueProvider = defineValueProvider({ provide: 'a', useValue: 'a' })
    const container = createContainer({ providers: [aValueProvider] })

    const sameAValueProvider = defineValueProvider({
      provide: 'a',
      useValue: 'a',
    })
    container.$createChild({ providers: [sameAValueProvider], override: true })

    await container.$destroy()
  })
})

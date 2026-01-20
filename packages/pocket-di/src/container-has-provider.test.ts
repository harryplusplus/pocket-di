import { describe, expect, it } from 'vitest'

import { createContainer } from './container.ts'

describe('Container hasProvider basic', () => {
  it('should return true when provider is registered', () => {
    class TestClass {}

    const container = createContainer({ providers: [TestClass] })

    expect(container.hasProvider(TestClass)).toBe(true)
  })

  it('should return false when provider is not registered', () => {
    class TestClass {}

    const container = createContainer({ providers: [] })

    expect(container.hasProvider(TestClass)).toBe(false)
  })

  it('should return true for value provider', () => {
    const container = createContainer({
      providers: [{ provide: 'test', useValue: 'value' }],
    })

    expect(container.hasProvider('test')).toBe(true)
  })

  it('should return true for factory provider', () => {
    const container = createContainer({
      providers: [{ provide: 'test', useFactory: () => ({}) }],
    })

    expect(container.hasProvider('test')).toBe(true)
  })
})

describe('Container hasProvider with parent', () => {
  it('should find provider in parent container', () => {
    class SharedService {}

    const parent = createContainer({ providers: [SharedService] })
    const child = parent.createChild({ providers: [] })

    expect(child.hasProvider(SharedService)).toBe(true)
  })

  it('should not find parent provider with localOnly option', () => {
    class SharedService {}

    const parent = createContainer({ providers: [SharedService] })
    const child = parent.createChild({ providers: [] })

    expect(child.hasProvider(SharedService, { localOnly: true })).toBe(false)
  })

  it('should find local provider with localOnly option', () => {
    class LocalService {}

    const parent = createContainer({ providers: [] })
    const child = parent.createChild({ providers: [LocalService] })

    expect(child.hasProvider(LocalService, { localOnly: true })).toBe(true)
  })

  it('should find overridden provider in child', () => {
    class Service {}

    const parent = createContainer({ providers: [Service] })
    const child = parent.createChild({
      providers: [{ provide: Service, useValue: {} }],
      override: true,
    })

    expect(child.hasProvider(Service)).toBe(true)
    expect(child.hasProvider(Service, { localOnly: true })).toBe(true)
  })
})

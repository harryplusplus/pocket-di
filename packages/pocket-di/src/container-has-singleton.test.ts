import { describe, expect, it } from 'vitest'

import { createContainer } from './container.ts'

describe('Container hasSingleton basic', () => {
  it('should return false when singleton not resolved yet', () => {
    class TestClass {}

    const container = createContainer({ providers: [TestClass] })

    expect(container.hasSingleton(TestClass)).toBe(false)
  })

  it('should return true after singleton is resolved', async () => {
    class TestClass {}

    const container = createContainer({ providers: [TestClass] })

    await container.resolve(TestClass)

    expect(container.hasSingleton(TestClass)).toBe(true)
  })

  it('should return false for transient scope', async () => {
    class TestClass {}

    const container = createContainer({
      providers: [
        { provide: TestClass, useClass: TestClass, scope: 'transient' },
      ],
    })

    await container.resolve(TestClass)

    expect(container.hasSingleton(TestClass)).toBe(false)
  })
})

describe('Container hasSingleton with parent', () => {
  it('should find singleton in parent container', async () => {
    class SharedService {}

    const parent = createContainer({ providers: [SharedService] })
    await parent.resolve(SharedService)

    const child = parent.createChild({ providers: [] })

    expect(child.hasSingleton(SharedService)).toBe(true)
  })

  it('should not find parent singleton with localOnly option', async () => {
    class SharedService {}

    const parent = createContainer({ providers: [SharedService] })
    await parent.resolve(SharedService)

    const child = parent.createChild({ providers: [] })

    expect(child.hasSingleton(SharedService, { localOnly: true })).toBe(false)
  })

  it('should find local singleton with localOnly option', async () => {
    class LocalService {}

    const parent = createContainer({ providers: [] })
    const child = parent.createChild({ providers: [LocalService] })

    await child.resolve(LocalService)

    expect(child.hasSingleton(LocalService, { localOnly: true })).toBe(true)
  })
})

describe('Container hasSingleton with value provider', () => {
  it('should return false for value provider', async () => {
    const container = createContainer({
      providers: [{ provide: 'test', useValue: 'value' }],
    })

    expect(container.hasSingleton('test')).toBe(false)

    await container.resolve('test')

    expect(container.hasSingleton('test')).toBe(false)
  })
})

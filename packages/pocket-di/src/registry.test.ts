// packages/pocket-di/src/registry.test.ts
import { describe, expect, it } from 'vitest'

import { Registry } from './registry.ts'

describe('registry - find with local only', () => {
  it('should return undefined when key not found with local-only search', () => {
    const registry = new Registry<string, string>()
    registry.set('key1', 'value1')

    // Search for non-existent key with local-only
    const result = registry.find('nonexistent', { include: ['local'] })

    expect(result).toBeUndefined()
  })

  it('should find value in local registry', () => {
    const registry = new Registry<string, string>()
    registry.set('key1', 'value1')

    const result = registry.find('key1', { include: ['local'] })

    expect(result).toBe('value1')
  })

  it('should not search parent when include is local only', () => {
    const parent = new Registry<string, string>()
    parent.set('parentKey', 'parentValue')

    const child = new Registry<string, string>(parent)
    child.set('childKey', 'childValue')

    // Search for parent key with local-only - should not find it
    const result = child.find('parentKey', { include: ['local'] })

    expect(result).toBeUndefined()
  })
})

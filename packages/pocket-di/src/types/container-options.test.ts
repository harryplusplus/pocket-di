import { describe, expect, it } from 'vitest'

import type { ContainerImpl } from '../container.ts'
import { fillContainerImplOptions } from './container-options.ts'

describe('fillContainerImplOptions', () => {
  it('should fill default values for parent and override', () => {
    const result = fillContainerImplOptions({ providers: [] })

    expect(result).toEqual({ providers: [], parent: null, override: false })
  })

  it('should preserve provided parent and override values', () => {
    const mockParent = {} as ContainerImpl

    const result = fillContainerImplOptions({
      providers: [],
      parent: mockParent,
      override: true,
    })

    expect(result).toEqual({
      providers: [],
      parent: mockParent,
      override: true,
    })
  })

  it('should override defaults with provided values', () => {
    const result = fillContainerImplOptions({
      providers: [],
      parent: null,
      override: false,
    })

    expect(result.parent).toBeNull()
    expect(result.override).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'

import { isPostConstructable, isPreDestroyable } from './lifecycle-events.ts'
import { postConstruct, preDestroy } from './symbols.ts'

describe('lifecycle-events', () => {
  describe('isPostConstructable', () => {
    it('should return true for object with postConstruct', () => {
      const injectable = {
        [postConstruct]: () => {},
      }

      expect(isPostConstructable(injectable)).toBe(true)
    })

    it('should return false for object without postConstruct', () => {
      const injectable = {}

      expect(isPostConstructable(injectable)).toBe(false)
    })

    it('should return false for object with preDestroy only', () => {
      const injectable = {
        [preDestroy]: () => {},
      }

      expect(isPostConstructable(injectable)).toBe(false)
    })
  })

  describe('isPreDestroyable', () => {
    it('should return true for object with preDestroy', () => {
      const injectable = {
        [preDestroy]: () => {},
      }

      expect(isPreDestroyable(injectable)).toBe(true)
    })

    it('should return false for object without preDestroy', () => {
      const injectable = {}

      expect(isPreDestroyable(injectable)).toBe(false)
    })

    it('should return false for object with postConstruct only', () => {
      const injectable = {
        [postConstruct]: () => {},
      }

      expect(isPreDestroyable(injectable)).toBe(false)
    })
  })
})

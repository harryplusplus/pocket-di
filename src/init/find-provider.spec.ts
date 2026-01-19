import { describe, expect, it } from 'vitest'

import { ContainerContext } from '../container-context.ts'
import { createFindProvider, findProvider } from './find-provider.ts'

describe('find-provider', () => {
  describe('createFindProvider', () => {
    it('should create find provider function', () => {
      const providers = new Map()
      providers.set('test', {
        provide: 'test',
        useValue: 'value',
      })

      const fn = createFindProvider({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        providers,
        parent: null,
      })

      const result = fn('test')

      expect(result).toEqual({
        provide: 'test',
        useValue: 'value',
      })
    })

    it('should return null when provider not found', () => {
      const providers = new Map()

      const fn = createFindProvider({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        providers,
        parent: null,
      })

      const result = fn('missing')

      expect(result).toBeNull()
    })

    it('should find provider in parent', () => {
      const parent = new ContainerContext({
        providers: [
          {
            provide: 'parent-token',
            useValue: 'parent-value',
          },
        ],
      })

      const providers = new Map()

      const fn = createFindProvider({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        providers,
        parent,
      })

      const result = fn('parent-token')

      expect(result).toEqual({
        provide: 'parent-token',
        useValue: 'parent-value',
      })
    })
  })

  describe('findProvider', () => {
    it('should find provider in current providers', () => {
      const providers = new Map()
      providers.set('test', {
        provide: 'test',
        useValue: 'value',
      })

      const result = findProvider({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        providers,
        parent: null,
        token: 'test',
      })

      expect(result).toEqual({
        provide: 'test',
        useValue: 'value',
      })
    })

    it('should return null when provider not found', () => {
      const providers = new Map()

      const result = findProvider({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        providers,
        parent: null,
        token: 'missing',
      })

      expect(result).toBeNull()
    })

    it('should find provider in parent', () => {
      const parent = new ContainerContext({
        providers: [
          {
            provide: 'parent-token',
            useValue: 'parent-value',
          },
        ],
      })

      const providers = new Map()

      const result = findProvider({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        providers,
        parent,
        token: 'parent-token',
      })

      expect(result).toEqual({
        provide: 'parent-token',
        useValue: 'parent-value',
      })
    })

    it('should prioritize current providers over parent', () => {
      const parent = new ContainerContext({
        providers: [
          {
            provide: 'test',
            useValue: 'parent-value',
          },
        ],
      })

      const providers = new Map()
      providers.set('test', {
        provide: 'test',
        useValue: 'child-value',
      })

      const result = findProvider({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        providers,
        parent,
        token: 'test',
      })

      expect(result).toEqual({
        provide: 'test',
        useValue: 'child-value',
      })
    })
  })
})

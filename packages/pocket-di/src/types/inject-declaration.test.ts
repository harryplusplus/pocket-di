import { describe, expect, it } from 'vitest'

import {
  type InjectDeclarationItem,
  isInjectableConstructorInjectDeclarationItem,
  isRecordInjectDeclaration,
  isTupleInjectDeclaration,
  isTypedTokenInjectDeclarationItem,
} from './inject-declaration.ts'
import { token } from './token.ts'

describe('isTupleInjectDeclaration', () => {
  it('should return true for array declaration', () => {
    const declaration = ['dep1', 'dep2'] as const

    expect(isTupleInjectDeclaration(declaration)).toBe(true)
  })

  it('should return false for object declaration', () => {
    const declaration = { dep1: 'dep1', dep2: 'dep2' }

    expect(isTupleInjectDeclaration(declaration)).toBe(false)
  })

  it('should return true for empty array', () => {
    const declaration = [] as const

    expect(isTupleInjectDeclaration(declaration)).toBe(true)
  })
})

describe('isRecordInjectDeclaration', () => {
  it('should return true for object declaration', () => {
    const declaration = { dep1: 'dep1', dep2: 'dep2' }

    expect(isRecordInjectDeclaration(declaration)).toBe(true)
  })

  it('should return false for array declaration', () => {
    const declaration = ['dep1', 'dep2'] as const

    expect(isRecordInjectDeclaration(declaration)).toBe(false)
  })

  it('should return true for empty object', () => {
    const declaration = {}

    expect(isRecordInjectDeclaration(declaration)).toBe(true)
  })
})

describe('isTypedTokenInjectDeclarationItem', () => {
  it('should return true for string token', () => {
    const item: InjectDeclarationItem = 'test-token'

    expect(isTypedTokenInjectDeclarationItem(item)).toBe(true)
  })

  it('should return true for symbol token', () => {
    const item: InjectDeclarationItem = Symbol('test')

    expect(isTypedTokenInjectDeclarationItem(item)).toBe(true)
  })

  it('should return true for typed token', () => {
    const item: InjectDeclarationItem = token('test')

    expect(isTypedTokenInjectDeclarationItem(item)).toBe(true)
  })

  it('should return false for class constructor', () => {
    class TestClass {}
    const item: InjectDeclarationItem = TestClass

    expect(isTypedTokenInjectDeclarationItem(item)).toBe(false)
  })
})

describe('isInjectableConstructorInjectDeclarationItem', () => {
  it('should return true for class constructor', () => {
    class TestClass {}
    const item: InjectDeclarationItem = TestClass

    expect(isInjectableConstructorInjectDeclarationItem(item)).toBe(true)
  })

  it('should return false for string token', () => {
    const item: InjectDeclarationItem = 'test-token'

    expect(isInjectableConstructorInjectDeclarationItem(item)).toBe(false)
  })

  it('should return false for symbol token', () => {
    const item: InjectDeclarationItem = Symbol('test')

    expect(isInjectableConstructorInjectDeclarationItem(item)).toBe(false)
  })
})

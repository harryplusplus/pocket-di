import { describe, expect, it } from 'vitest'

import {
  type DependencyDeclarationItem,
  isInjectableConstructorDependencyDeclarationItem,
  isRecordDependencyDeclaration,
  isTupleDependencyDeclaration,
  isTypedTokenDependencyDeclarationItem,
} from './dependency-declaration.ts'
import { token } from './token.ts'

describe('isTupleDependencyDeclaration', () => {
  it('should return true for array declaration', () => {
    const declaration = [token('dep1'), token('dep2')] as const

    expect(isTupleDependencyDeclaration(declaration)).toBe(true)
  })

  it('should return false for object declaration', () => {
    const declaration = { dep1: token('dep1'), dep2: token('dep2') }

    expect(isTupleDependencyDeclaration(declaration)).toBe(false)
  })

  it('should return true for empty array', () => {
    const declaration = [] as const

    expect(isTupleDependencyDeclaration(declaration)).toBe(true)
  })
})

describe('isRecordDependencyDeclaration', () => {
  it('should return true for object declaration', () => {
    const declaration = { dep1: token('dep1'), dep2: token('dep2') }

    expect(isRecordDependencyDeclaration(declaration)).toBe(true)
  })

  it('should return false for array declaration', () => {
    const declaration = [token('dep1'), token('dep2')] as const

    expect(isRecordDependencyDeclaration(declaration)).toBe(false)
  })

  it('should return true for empty object', () => {
    const declaration = {}

    expect(isRecordDependencyDeclaration(declaration)).toBe(true)
  })
})

describe('isTypedTokenDependencyDeclarationItem', () => {
  it('should return true for string token', () => {
    const item: DependencyDeclarationItem = token('test-token')

    expect(isTypedTokenDependencyDeclarationItem(item)).toBe(true)
  })

  it('should return true for symbol token', () => {
    const item: DependencyDeclarationItem = token(Symbol('test'))

    expect(isTypedTokenDependencyDeclarationItem(item)).toBe(true)
  })

  it('should return true for typed token', () => {
    const item: DependencyDeclarationItem = token('test')

    expect(isTypedTokenDependencyDeclarationItem(item)).toBe(true)
  })

  it('should return false for class constructor', () => {
    class TestClass {}
    const item: DependencyDeclarationItem = TestClass

    expect(isTypedTokenDependencyDeclarationItem(item)).toBe(false)
  })
})

describe('isInjectableConstructorDependencyDeclarationItem', () => {
  it('should return true for class constructor', () => {
    class TestClass {}
    const item: DependencyDeclarationItem = TestClass

    expect(isInjectableConstructorDependencyDeclarationItem(item)).toBe(true)
  })

  it('should return false for string token', () => {
    const item: DependencyDeclarationItem = token('test-token')

    expect(isInjectableConstructorDependencyDeclarationItem(item)).toBe(false)
  })

  it('should return false for symbol token', () => {
    const item: DependencyDeclarationItem = token(Symbol('test'))

    expect(isInjectableConstructorDependencyDeclarationItem(item)).toBe(false)
  })
})

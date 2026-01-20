import { describe, expect, it } from 'vitest'

import { validateDeclarationName } from './validate-declaration-name.ts'

describe('validateDeclarationName invalid names', () => {
  it('should throw error for empty name', () => {
    expect(() =>
      validateDeclarationName({
        token: 'test',
        className: 'TestClass',
        name: '',
      }),
    ).toThrow(
      'Cannot register token "test" (class "TestClass"): invalid dependency property name ""',
    )
  })

  it('should throw error for __proto__', () => {
    expect(() =>
      validateDeclarationName({
        token: 'test',
        className: 'TestClass',
        name: '__proto__',
      }),
    ).toThrow(
      'Cannot register token "test" (class "TestClass"): invalid dependency property name "__proto__"',
    )
  })

  it('should throw error for constructor', () => {
    expect(() =>
      validateDeclarationName({
        token: 'test',
        className: 'TestClass',
        name: 'constructor',
      }),
    ).toThrow(
      'Cannot register token "test" (class "TestClass"): invalid dependency property name "constructor"',
    )
  })

  it('should throw error for prototype', () => {
    expect(() =>
      validateDeclarationName({
        token: 'test',
        className: 'TestClass',
        name: 'prototype',
      }),
    ).toThrow(
      'Cannot register token "test" (class "TestClass"): invalid dependency property name "prototype"',
    )
  })
})

describe('validateDeclarationName valid cases', () => {
  it('should throw error without class name', () => {
    expect(() =>
      validateDeclarationName({
        token: 'test',
        className: null,
        name: '__proto__',
      }),
    ).toThrow(
      'Cannot register token "test": invalid dependency property name "__proto__"',
    )
  })

  it('should not throw for valid name', () => {
    expect(() =>
      validateDeclarationName({
        token: 'test',
        className: 'TestClass',
        name: 'validName',
      }),
    ).not.toThrow()
  })
})

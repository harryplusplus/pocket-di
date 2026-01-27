/**
 * @file InjectionToken is a key used to provide or use an injectable instance.
 * You can use string, symbol, a constructor that provides an injectable instance,
 * or a token object with type information as an injection token.
 * Unless overridden in a child container, this injection token must be unique.
 */

import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import { type } from './symbols.ts'

export type InjectionToken<I extends Injectable = Injectable> =
  | PlainToken
  | HasTypeToken<I>

export type PlainToken = string | symbol

export type HasTypeToken<I extends Injectable = Injectable> =
  | TypedToken<I>
  | InjectableConstructor<I>

/**
 * KeyToken is a type that can be used as a key in Map.
 * - PlainToken: string | symbol
 * - InjectableConstructor: class constructor
 * TypedToken is NOT included because it's an object and cannot be used as Map key.
 */
export type KeyToken = PlainToken | InjectableConstructor

export function isPlainToken(token: InjectionToken): token is PlainToken {
  return typeof token === 'string' || typeof token === 'symbol'
}

export interface TypedToken<I extends Injectable = Injectable> {
  token: string | symbol
  [type]: I
}

export function defineToken<I extends Injectable>(
  token: PlainToken,
): TypedToken<I> {
  return { token, [type]: undefined as unknown as I }
}

export function isTypedToken(token: InjectionToken): token is TypedToken {
  return typeof token === 'object' && type in token
}

export function isConstructorToken(
  token: InjectionToken,
): token is InjectableConstructor {
  return typeof token === 'function'
}

/**
 * Convert InjectionToken to KeyToken for use as Map key.
 * - TypedToken: extracts the inner token (string | symbol)
 * - PlainToken: returns as-is
 * - InjectableConstructor: returns as-is
 */
export function toKeyToken(token: InjectionToken): KeyToken {
  if (isTypedToken(token)) {
    return token.token
  }
  return token
}

/**
 * Converts an InjectionToken to its string representation.
 *
 * - For `string`: returns the string as-is
 * - For `symbol`: returns `Symbol(description)` or `Symbol()`
 * - For `TypedToken`: returns string representation of the inner token
 * - For `InjectableConstructor`: returns the class name (function.name)
 *
 * @param token - The token to convert
 * @returns String representation of the token
 *
 * @example
 * ```ts
 * tokenToString('my-token') // 'my-token'
 * tokenToString(Symbol('foo')) // 'Symbol(foo)'
 * tokenToString(defineToken<number>('num')) // 'num'
 * tokenToString(class Service {}) // 'Service'
 * ```
 */
export function tokenToString(token: InjectionToken): string {
  // InjectableConstructor: use class name
  if (isConstructorToken(token)) {
    return token.name || '(anonymous class)'
  }

  // TypedToken: extract the inner token
  if (isTypedToken(token)) {
    const innerToken = token.token
    return tokenToString(innerToken)
  }

  // symbol
  if (typeof token === 'symbol') {
    return token.description ? `Symbol(${token.description})` : 'Symbol()'
  }

  // string (default)
  return token
}

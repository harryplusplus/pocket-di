/**
 * @file Utility functions for working with InjectionToken.
 */

import type { InjectionToken } from './token.ts'
import { isConstructorToken, isTypedToken } from './token.ts'

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

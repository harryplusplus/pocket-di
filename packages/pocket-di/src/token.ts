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

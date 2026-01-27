/**
 * @file InjectionToken은 injectable instance를 제공하거나 사용하기 위해 사용하는 key입니다.
 * string, symbol, injectable instance를 제공하는 constructor 또는 type 정보를 가진 token 객체를 injection token으로 사용할 수 있습니다.
 * child container에서 override하지 않는 한, 이 injection token은 unique해야 합니다.
 */

import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import { type } from './symbols.ts'

export type InjectionToken<I extends Injectable = Injectable> =
  | PlainToken
  | HasTypeToken<I>

export type PlainToken = string | symbol

export type HasTypeToken<I extends Injectable = Injectable> =
  | TokenWithType<I>
  | InjectableConstructor<I>

export function isPlainToken(token: InjectionToken): token is PlainToken {
  return typeof token === 'string' || typeof token === 'symbol'
}

export interface TokenWithType<I extends Injectable = Injectable> {
  token: string | symbol
  [type]: I
}

export function tokenWithType<I extends Injectable>(
  token: PlainToken,
): TokenWithType<I> {
  return { token, [type]: undefined as unknown as I }
}

export function isTokenWithTypeToken(
  token: InjectionToken,
): token is TokenWithType {
  return typeof token === 'object' && type in token
}

export function isConstructorToken(
  token: InjectionToken,
): token is InjectableConstructor {
  return typeof token === 'function'
}

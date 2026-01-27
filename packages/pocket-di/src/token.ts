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

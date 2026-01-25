import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import { type } from './symbols.ts'

export type InjectionToken<I extends Injectable = Injectable> =
  | string
  | symbol
  | TypedToken<I>
  | InjectableConstructor<I>

export function isPlainToken(token: InjectionToken): token is string | symbol {
  return typeof token === 'string' || typeof token === 'symbol'
}

export interface TypedToken<I extends Injectable = Injectable> {
  token: string | symbol
  [type]: I
}

export function typedToken<I extends Injectable>(
  token: string | symbol,
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

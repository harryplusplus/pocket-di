import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import { plainToken, type } from './symbols.ts'

export type InjectionToken<I extends Injectable = Injectable> =
  | PlainToken
  | InferableToken<I>

export function tokenToString(token: InjectionToken): string {
  if (isInjectableConstructorToken(token)) {
    return token.name
  } else if (isTypedToken(token)) {
    return token[plainToken].toString()
  }

  return token.toString()
}

export type PlainToken = string | symbol

export function isPlainToken(token: InjectionToken): token is PlainToken {
  return typeof token === 'string' || typeof token === 'symbol'
}

export type InferableToken<I extends Injectable = Injectable> =
  | TypedToken<I>
  | InjectableConstructor<I>

export type InferInjectable<T> =
  T extends InferableToken<infer I> ? I : Injectable

export function isInjectableConstructorToken(
  token: InjectionToken,
): token is InjectableConstructor {
  return typeof token === 'function'
}

export interface TypedToken<I extends Injectable = Injectable> {
  [plainToken]: PlainToken
  [type]?: I
}

export function token<I extends Injectable>(token: PlainToken): TypedToken<I> {
  return { [plainToken]: token, [type]: undefined }
}

export function isTypedToken<I extends Injectable>(
  token: InjectionToken,
): token is TypedToken<I> {
  return typeof token === 'object' && plainToken in token
}

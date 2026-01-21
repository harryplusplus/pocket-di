import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { type } from './symbols.ts'

export type InjectionToken<I extends Injectable = Injectable> =
  | PlainToken
  | InferableToken<I>

export type PlainToken = string | symbol

export type InferableToken<I extends Injectable = Injectable> =
  | TypedToken<I>
  | InjectableConstructor<I>

export type InferInjectable<T> =
  T extends InferableToken<infer I> ? I : Injectable

export function tokenToString(token: InjectionToken): string {
  if (typeof token === 'function') {
    return token.name
  }

  return token.toString()
}

export type TypedToken<I extends Injectable = Injectable> = PlainToken & {
  [type]?: I
}

export function token<I extends Injectable>(token: PlainToken): TypedToken<I> {
  return token
}

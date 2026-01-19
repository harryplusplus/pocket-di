import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { type } from './symbols.ts'

export type InjectionToken<I extends Injectable = Injectable> =
  | string
  | symbol
  | TypedToken<I>
  | InjectableConstructor<I, InjectDeclaration>

export function tokenToString(token: InjectionToken): string {
  if (typeof token === 'function') {
    return token.name
  }

  return token.toString()
}

export type TypedToken<I extends Injectable = Injectable> = (
  | string
  | symbol
) & {
  [type]?: I
}

export function token<I extends Injectable>(
  token: string | symbol,
): TypedToken<I> {
  return token
}

import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { Provider } from './provider.ts'
import type { Any } from './utils.ts'

export type Providable<
  I extends Injectable = Injectable,
  ID extends InjectDeclaration = InjectDeclaration,
  C extends I = I,
> = Provider<I, ID, C> | InjectableConstructor<I, ID>

export type AnyProvidable = Providable<Any, Any, Any>

export function isProviderProvidable(x: Providable): x is Provider {
  return 'provide' in x
}

export function isInjectableConstructorProvidable(
  x: Providable,
): x is InjectableConstructor {
  return typeof x === 'function'
}

export function providableToProvider(x: Providable): Provider {
  if (isProviderProvidable(x)) {
    return x
  }

  return { provide: x, useClass: x }
}

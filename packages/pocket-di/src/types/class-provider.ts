import type { DependencyDeclaration } from './dependency-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { Scope } from './scope.ts'
import { inject } from './symbols.ts'
import {
  type InferableToken,
  type InferInjectable,
  type InjectionToken,
  isPlainToken,
  type PlainToken,
  token,
  type TypedToken,
} from './token.ts'

export interface ClassProviderInput<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: T
  useClass: InjectableConstructor<C, D>
  scope?: Scope
}

export interface ClassProvider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: T
  useClass: InjectableConstructor<C, D>
  scope?: Scope
}

function defineClassProvider<
  T extends PlainToken,
  I extends Injectable,
  D extends DependencyDeclaration,
>(
  provider: ClassProviderInput<T, I, I, D>,
): ClassProvider<TypedToken<I>, I, I, D>

function defineClassProvider<
  T extends InferableToken,
  C extends InferInjectable<T>,
  D extends DependencyDeclaration,
>(
  provider: ClassProviderInput<T, InferInjectable<T>, C, D>,
): ClassProvider<T, InferInjectable<T>, C, D>

function defineClassProvider(provider: ClassProviderInput): ClassProvider {
  const { provide, ...rest } = provider
  if (isPlainToken(provide)) {
    return { provide: token(provide), ...rest }
  }

  return { provide, ...rest }
}

export { defineClassProvider }

export function classProviderToDeclaration(
  x: ClassProvider,
): DependencyDeclaration {
  return x.useClass[inject] ?? {}
}

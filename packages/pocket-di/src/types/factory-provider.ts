import type { Dependencies } from './dependencies.ts'
import type { DependencyDeclaration } from './dependency-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Singleton, Transient } from './scope.ts'
import {
  type InferableToken,
  type InferInjectable,
  type InjectionToken,
  isPlainToken,
  type PlainToken,
  token,
  type TypedToken,
} from './token.ts'
import type { MaybePromise } from './utils.ts'

export interface SingletonFactoryProviderInput<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: T
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface TransientFactoryProviderInput<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: T
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

export type FactoryProviderInput<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> =
  | SingletonFactoryProviderInput<T, I, C, D>
  | TransientFactoryProviderInput<T, I, C, D>

export interface SingletonFactoryProvider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: T
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface TransientFactoryProvider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: T
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

export type FactoryProvider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> = SingletonFactoryProvider<T, I, C, D> | TransientFactoryProvider<T, I, C, D>

function defineFactoryProvider<
  T extends PlainToken,
  I extends Injectable,
  D extends DependencyDeclaration,
>(
  provider: FactoryProviderInput<T, I, I, D>,
): FactoryProvider<TypedToken<I>, I, I, D>

function defineFactoryProvider<
  T extends InferableToken,
  C extends InferInjectable<T>,
  D extends DependencyDeclaration,
>(
  provider: FactoryProviderInput<T, InferInjectable<T>, C, D>,
): FactoryProvider<T, InferInjectable<T>, C, D>

function defineFactoryProvider(
  provider: FactoryProviderInput,
): FactoryProvider {
  const { provide, ...rest } = provider
  if (isPlainToken(provide)) {
    return { provide: token(provide), ...rest }
  }

  return { provide, ...rest }
}

export { defineFactoryProvider }

export function factoryProviderToDeclaration(
  x: FactoryProvider,
): DependencyDeclaration {
  return x.inject ?? {}
}

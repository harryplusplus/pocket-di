import type { Dependencies } from './dependencies.ts'
import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { Scope, Singleton, Transient } from './scope.ts'
import { inject } from './symbols.ts'
import { type InferInjectable, type InjectionToken } from './token.ts'
import type { MaybePromise } from './utils.ts'

export type Provider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> =
  | ValueProvider<T, I>
  | ClassProvider<T, I, C, D>
  | FactoryProvider<T, I, C, D>

export function defineProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
>(provider: Provider<T, I, C, D>): Provider<T, I, C, D> {
  return provider
}

export interface ValueProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
> {
  provide: T
  useValue: C
}

function defineValueProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
>(provider: ValueProvider<T, I, C>): ValueProvider<T, I, C> {
  return provider
}

export { defineValueProvider }

export function isValueProvider(x: Provider): x is ValueProvider {
  return 'useValue' in x
}

export interface ClassProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> {
  provide: T
  useClass: InjectableConstructor<C, D>
  scope?: Scope
}

function defineClassProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
>(provider: ClassProvider<T, I, C, D>): ClassProvider<T, I, C, D> {
  return provider
}

export { defineClassProvider }

export function isClassProvider(x: Provider): x is ClassProvider {
  return 'useClass' in x
}

export function classProviderToDeclaration(
  x: ClassProvider,
): InjectDeclaration {
  return x.useClass[inject] ?? {}
}

export interface SingletonFactoryProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> {
  provide: T
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface TransientFactoryProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> {
  provide: T
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

export type FactoryProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> = SingletonFactoryProvider<T, I, C, D> | TransientFactoryProvider<T, I, C, D>

function defineFactoryProvider<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
>(provider: FactoryProvider<T, I, C, D>): FactoryProvider<T, I, C, D> {
  return provider
}

export { defineFactoryProvider }

export function isFactoryProvider(x: Provider): x is FactoryProvider {
  return 'useFactory' in x
}

export function factoryProviderToDeclaration(
  x: FactoryProvider,
): InjectDeclaration {
  return x.inject ?? {}
}

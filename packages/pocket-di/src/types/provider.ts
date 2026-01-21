import type { Dependencies } from './dependencies.ts'
import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { Scope, Singleton, Transient } from './scope.ts'
import { inject } from './symbols.ts'
import { type InjectionToken } from './token.ts'
import type { MaybePromise } from './utils.ts'

export type Provider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> = ValueProvider<I> | ClassProvider<I, C, D> | FactoryProvider<I, C, D>

export interface ProviderBase<I extends Injectable> {
  provide: InjectionToken<I>
}

export interface ValueProvider<
  I extends Injectable = Injectable,
> extends ProviderBase<I> {
  useValue: Injectable
}

export function isValueProvider(x: Provider): x is ValueProvider {
  return 'useValue' in x
}

export interface ClassProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> extends ProviderBase<I> {
  useClass: InjectableConstructor<C, D>
  scope?: Scope
}

export function defineClassProvider<
  I extends Injectable,
  C extends I,
  D extends InjectDeclaration,
>(provider: ClassProvider<I, C, D>): ClassProvider<I, C, D> {
  return provider
}

export function isClassProvider(x: Provider): x is ClassProvider {
  return 'useClass' in x
}

export function classProviderToDeclaration(
  x: ClassProvider,
): InjectDeclaration {
  return x.useClass[inject] ?? {}
}

export interface SingletonFactoryProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> extends ProviderBase<I> {
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface TransientFactoryProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> extends ProviderBase<I> {
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

export type FactoryProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> = SingletonFactoryProvider<I, C, D> | TransientFactoryProvider<I, C, D>

export function defineFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends InjectDeclaration,
>(provider: FactoryProvider<I, C, D>): FactoryProvider<I, C, D>
export function defineFactoryProvider<I extends Injectable>(): <
  C extends I,
  D extends InjectDeclaration,
>(
  provider: FactoryProvider<I, C, D>,
) => FactoryProvider<I, C, D>
export function defineFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends InjectDeclaration,
>(
  provider?: FactoryProvider<I, C, D>,
):
  | FactoryProvider<I, C, D>
  | (<C extends I, D extends InjectDeclaration>(
      provider: FactoryProvider<I, C, D>,
    ) => FactoryProvider<I, C, D>) {
  if (provider) {
    return provider
  }

  return (provider) => provider
}

export function isFactoryProvider(x: Provider): x is FactoryProvider {
  return 'useFactory' in x
}

export function factoryProviderToDeclaration(
  x: FactoryProvider,
): InjectDeclaration {
  return x.inject ?? {}
}

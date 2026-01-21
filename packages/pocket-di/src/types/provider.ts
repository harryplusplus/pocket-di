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
  ID extends InjectDeclaration = InjectDeclaration,
  C extends I = I,
> = ValueProvider<I> | ClassProvider<I, C> | FactoryProvider<I, ID, C>

export interface ProviderFn<I extends Injectable> {
  <ID extends InjectDeclaration, C extends I>(
    provider: Provider<I, ID, C>,
  ): Provider<I, ID, C>
}

function defineProvider<
  I extends Injectable = Injectable,
  ID extends InjectDeclaration = InjectDeclaration,
>(provider: Provider<I, ID, I>): Provider<I, ID, I>
function defineProvider<I extends Injectable>(): ProviderFn<I>
function defineProvider<
  I extends Injectable = Injectable,
  ID extends InjectDeclaration = InjectDeclaration,
>(provider?: Provider<I, ID, I>): Provider<I, ID, I> | ProviderFn<I> {
  if (provider) {
    return provider
  }

  return (provider) => provider
}

export { defineProvider }

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
> extends ProviderBase<I> {
  useClass: InjectableConstructor<C>
  scope?: Scope
}

export function defineClassProvider<I extends Injectable, C extends I>(
  provider: ClassProvider<I, C>,
): ClassProvider<I, C> {
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
  I extends Injectable,
  ID extends InjectDeclaration,
  C extends I,
> extends ProviderBase<I> {
  inject?: ID
  useFactory: (dependencies: Dependencies<ID>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface TransientFactoryProvider<
  I extends Injectable,
  ID extends InjectDeclaration,
  C extends I,
> extends ProviderBase<I> {
  inject?: ID
  useFactory: (dependencies: Dependencies<ID>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

export type FactoryProvider<
  I extends Injectable = Injectable,
  ID extends InjectDeclaration = InjectDeclaration,
  C extends I = I,
> = SingletonFactoryProvider<I, ID, C> | TransientFactoryProvider<I, ID, C>

export function isFactoryProvider(x: Provider): x is FactoryProvider {
  return 'useFactory' in x
}

export function factoryProviderToDeclaration(
  x: FactoryProvider,
): InjectDeclaration {
  return x.inject ?? {}
}

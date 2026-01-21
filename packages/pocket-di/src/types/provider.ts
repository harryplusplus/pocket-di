import type { Dependencies } from './dependencies.ts'
import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { Scope, Singleton, Transient } from './scope.ts'
import { inject } from './symbols.ts'
import {
  type InferableToken,
  type InferInjectable,
  type InjectionToken,
  type PlainToken,
  type TypedToken,
} from './token.ts'
import type { MaybePromise } from './utils.ts'

export type Provider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> =
  | ValueProvider<T, I>
  | ClassProvider<T, I, C, D>
  | FactoryProvider<T, I, C, D>

export interface ValueProviderInput<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
> {
  provide: T
  useValue: C
}

export interface ValueProvider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
> {
  provide: T
  useValue: C
}

function defineValueProvider<T extends PlainToken, I extends Injectable>(
  provider: ValueProviderInput<T, I, I>,
): ValueProvider<TypedToken<I>, I, I>

function defineValueProvider<
  T extends InferableToken,
  C extends InferInjectable<T>,
>(
  provider: ValueProviderInput<T, InferInjectable<T>, C>,
): ValueProvider<T, InferInjectable<T>, C>

function defineValueProvider(provider: ValueProviderInput): ValueProvider {
  return provider
}

export { defineValueProvider }

export function isValueProvider(x: Provider): x is ValueProvider {
  return 'useValue' in x
}

export interface ClassProviderInput<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> {
  provide: T
  useClass: InjectableConstructor<C, D>
  scope?: Scope
}

export interface ClassProvider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> {
  provide: T
  useClass: InjectableConstructor<C, D>
  scope?: Scope
}

function defineClassProvider<
  T extends PlainToken,
  I extends Injectable,
  D extends InjectDeclaration,
>(
  provider: ClassProviderInput<T, I, I, D>,
): ClassProvider<TypedToken<I>, I, I, D>

function defineClassProvider<
  T extends InferableToken,
  C extends InferInjectable<T>,
  D extends InjectDeclaration,
>(
  provider: ClassProviderInput<T, InferInjectable<T>, C, D>,
): ClassProvider<T, InferInjectable<T>, C, D>

function defineClassProvider(provider: ClassProviderInput): ClassProvider {
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

export interface SingletonFactoryProviderInput<
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

export interface TransientFactoryProviderInput<
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

export type FactoryProviderInput<
  T extends InjectionToken = InjectionToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> =
  | SingletonFactoryProviderInput<T, I, C, D>
  | TransientFactoryProviderInput<T, I, C, D>

export interface SingletonFactoryProvider<
  T extends InferableToken = InferableToken,
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
  T extends InferableToken = InferableToken,
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
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> = SingletonFactoryProvider<T, I, C, D> | TransientFactoryProvider<T, I, C, D>

function defineFactoryProvider<
  T extends PlainToken,
  I extends Injectable,
  D extends InjectDeclaration,
>(
  provider: FactoryProviderInput<T, I, I, D>,
): FactoryProvider<TypedToken<I>, I, I, D>

function defineFactoryProvider<
  T extends InferableToken,
  C extends InferInjectable<T>,
  D extends InjectDeclaration,
>(
  provider: FactoryProviderInput<T, InferInjectable<T>, C, D>,
): FactoryProvider<T, InferInjectable<T>, C, D>

function defineFactoryProvider(
  provider: FactoryProviderInput,
): FactoryProvider {
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

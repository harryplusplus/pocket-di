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

export interface ValueProviderBase<I extends Injectable = Injectable> {
  useValue: I
}

export interface ValueProviderInput<
  I extends Injectable = Injectable,
> extends ValueProviderBase<I> {
  provide: string | symbol
}

export interface ValueProvider<
  I extends Injectable = Injectable,
> extends ValueProviderBase<I> {
  provide: InjectionToken<I>
}

function defineValueProvider<I extends Injectable>(
  provider: ValueProviderInput<I>,
): ValueProvider<I>
function defineValueProvider<I extends Injectable>(
  provider: ValueProvider<I>,
): ValueProvider<I> {
  return provider
}

export { defineValueProvider }

export function isValueProvider(x: Provider): x is ValueProvider {
  return 'useValue' in x
}

export interface ClassProviderBase<
  I extends Injectable = Injectable,
  D extends InjectDeclaration = InjectDeclaration,
> {
  useClass: InjectableConstructor<I, D>
  scope?: Scope
}

export interface ClassProviderInput<
  I extends Injectable = Injectable,
  D extends InjectDeclaration = InjectDeclaration,
> extends ClassProviderBase<I, D> {
  provide: string | symbol
}

export interface ClassProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> extends ClassProviderBase<C, D> {
  provide: InjectionToken<I>
}

function defineClassProvider<I extends Injectable, D extends InjectDeclaration>(
  provider: ClassProviderInput<I, D>,
): ClassProvider<I, I, D>
function defineClassProvider<
  I extends Injectable,
  C extends I,
  D extends InjectDeclaration,
>(provider: ClassProvider<I, C, D>): ClassProvider<I, C, D> {
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

export interface SingletonFactoryProviderBase<
  I extends Injectable = Injectable,
  D extends InjectDeclaration = InjectDeclaration,
> {
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<I>
  scope?: Singleton
  preDestroy?: (instance: I) => MaybePromise<void>
}

export interface SingletonFactoryProviderInput<
  I extends Injectable = Injectable,
  D extends InjectDeclaration = InjectDeclaration,
> extends SingletonFactoryProviderBase<I, D> {
  provide: string | symbol
}

export interface SingletonFactoryProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> extends SingletonFactoryProviderBase<C, D> {
  provide: InjectionToken<I>
}

export interface TransientFactoryProviderBase<
  I extends Injectable = Injectable,
  D extends InjectDeclaration = InjectDeclaration,
> {
  inject?: D
  useFactory: (dependencies: Dependencies<D>) => MaybePromise<I>
  scope: Transient
  preDestroy?: never
}

export interface TransientFactoryProviderInput<
  I extends Injectable = Injectable,
  D extends InjectDeclaration = InjectDeclaration,
> extends TransientFactoryProviderBase<I, D> {
  provide: string | symbol
}

export interface TransientFactoryProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> extends TransientFactoryProviderBase<C, D> {
  provide: InjectionToken<I>
}

export type FactoryProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> = SingletonFactoryProvider<I, C, D> | TransientFactoryProvider<I, C, D>

function defineFactoryProvider<
  I extends Injectable,
  D extends InjectDeclaration,
>(
  provider: SingletonFactoryProviderInput<I, D>,
): SingletonFactoryProvider<I, I, D>
function defineFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends InjectDeclaration,
>(
  provider: SingletonFactoryProvider<I, C, D>,
): SingletonFactoryProvider<I, C, D>
function defineFactoryProvider<
  I extends Injectable,
  D extends InjectDeclaration,
>(
  provider: TransientFactoryProviderInput<I, D>,
): TransientFactoryProvider<I, I, D>
function defineFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends InjectDeclaration,
>(
  provider: TransientFactoryProvider<I, C, D>,
): TransientFactoryProvider<I, C, D>
function defineFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends InjectDeclaration,
>(provider: FactoryProvider<I, C, D>): FactoryProvider<I, C, D> {
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

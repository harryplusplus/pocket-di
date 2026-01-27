/**
 * @file FactoryProvider provides a factory function
 * You can define scope
 * You can define dependency declaration through inject property
 * useFactory is a factory function that creates injectable instance, can return Promise
 * If resolved via resolveSync(), useFactory must not return Promise or throws error
 * preDestroy defines lifecycle event to execute before destroy
 */

import type {
  DependencyDeclaration,
  ExtractDependencies,
} from './dependency-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Scope, Singleton, Transient } from './scope.ts'
import {
  type HasTypeToken,
  type InjectionToken,
  type PlainToken,
} from './token.ts'
import type { MaybePromise } from './utils.ts'

const DEFAULT_SCOPE: Scope = 'singleton'
const DEFAULT_PRE_DESTROY = () => {}
const DEFAULT_INJECT: DependencyDeclaration = {}

export interface FactoryProvider<
  I extends Injectable = Injectable,
  C extends I = I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: InjectionToken<I>
  inject: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope: Scope
  preDestroy: (instance: C) => MaybePromise<void>
}

// Inferable (provide: PlainToken)
export interface InferableSingletonFactoryProvider<
  C extends Injectable,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: PlainToken
  inject?: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface InferableTransientFactoryProvider<
  C extends Injectable,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: PlainToken
  inject?: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

// Validatable (provide: HasTypeToken)
export interface ValidatableSingletonFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: HasTypeToken<I>
  inject?: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface ValidatableTransientFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  provide: HasTypeToken<I>
  inject?: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

// Singleton overloads
function defineFactoryProvider<
  C extends Injectable,
  D extends DependencyDeclaration,
>(provider: InferableSingletonFactoryProvider<C, D>): FactoryProvider<C, C, D>

function defineFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration,
>(
  provider: ValidatableSingletonFactoryProvider<I, C, D>,
): FactoryProvider<I, C, D>

// Transient overloads
function defineFactoryProvider<
  C extends Injectable,
  D extends DependencyDeclaration,
>(provider: InferableTransientFactoryProvider<C, D>): FactoryProvider<C, C, D>

function defineFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration,
>(
  provider: ValidatableTransientFactoryProvider<I, C, D>,
): FactoryProvider<I, C, D>

// Implementation
function defineFactoryProvider<
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration,
>(
  provider:
    | InferableSingletonFactoryProvider<C, D>
    | ValidatableSingletonFactoryProvider<I, C, D>
    | InferableTransientFactoryProvider<C, D>
    | ValidatableTransientFactoryProvider<I, C, D>,
): FactoryProvider<I, C, D> {
  const {
    scope = DEFAULT_SCOPE,
    preDestroy = DEFAULT_PRE_DESTROY,
    inject = DEFAULT_INJECT as D,
    ...rest
  } = provider

  return { ...rest, scope, preDestroy, inject }
}

export { defineFactoryProvider }

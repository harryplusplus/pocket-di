import type {
  DependencyDeclaration,
  ExtractDependencies,
} from './dependency-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { Scope, Singleton, Transient } from './scope.ts'
import { type Key, type Token, token } from './token.ts'
import type { Any, MaybePromise } from './utils.ts'

const DEFAULT_SCOPE: Scope = 'singleton'
const DEFAULT_PRE_DESTROY = () => {}
const DEFAULT_INJECT: DependencyDeclaration = {}

export interface FactoryProvider<
  K extends Key = Any,
  I extends Injectable = Any,
  C extends I = Any,
  D extends DependencyDeclaration = Any,
> {
  token: Token<K, I>
  inject: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope: Scope
  preDestroy: (instance: C) => MaybePromise<void>
}

export interface InferableSingletonFactoryProvider<
  K extends Key,
  C extends Injectable,
  D extends DependencyDeclaration,
> {
  provide: K
  inject?: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface ValidatableSingletonFactoryProvider<
  K extends Key,
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration,
> {
  provide: Token<K, I>
  inject?: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope?: Singleton
  preDestroy?: (instance: C) => MaybePromise<void>
}

export interface InferableTransientFactoryProvider<
  K extends Key,
  C extends Injectable,
  D extends DependencyDeclaration,
> {
  provide: K
  inject?: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

export interface ValidatableTransientFactoryProvider<
  K extends Key,
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration,
> {
  provide: Token<K, I>
  inject?: D
  useFactory: (dependencies: ExtractDependencies<D>) => MaybePromise<C>
  scope: Transient
  preDestroy?: never
}

function defineFactoryProvider<
  K extends Key,
  C extends Injectable,
  D extends DependencyDeclaration,
>(
  provider: InferableSingletonFactoryProvider<K, C, D>,
): FactoryProvider<K, C, C, D>

function defineFactoryProvider<
  K extends Key,
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration,
>(
  provider: ValidatableSingletonFactoryProvider<K, I, C, D>,
): FactoryProvider<K, I, C, D>

function defineFactoryProvider<
  K extends Key,
  C extends Injectable,
  D extends DependencyDeclaration,
>(
  provider: InferableTransientFactoryProvider<K, C, D>,
): FactoryProvider<K, C, C, D>

function defineFactoryProvider<
  K extends Key,
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration,
>(
  provider: ValidatableTransientFactoryProvider<K, I, C, D>,
): FactoryProvider<K, I, C, D>

function defineFactoryProvider<
  K extends Key,
  I extends Injectable,
  C extends I,
  D extends DependencyDeclaration,
>(
  provider:
    | InferableSingletonFactoryProvider<K, C, D>
    | ValidatableSingletonFactoryProvider<K, I, C, D>
    | InferableTransientFactoryProvider<K, C, D>
    | ValidatableTransientFactoryProvider<K, I, C, D>,
): FactoryProvider<K, I, C, D> {
  const {
    provide,
    scope = DEFAULT_SCOPE,
    preDestroy = DEFAULT_PRE_DESTROY,
    inject = DEFAULT_INJECT as D,
    ...rest
  } = provider

  return {
    token: typeof provide === 'string' ? token<I>()(provide) : provide,
    scope,
    preDestroy,
    inject,
    ...rest,
  }
}

export { defineFactoryProvider }

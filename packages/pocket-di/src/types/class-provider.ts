import type { DependencyDeclaration } from './dependency-declaration.ts'
import type { Injectable } from './injectable.ts'
import type {
  ExtractDependencyDeclaration,
  ExtractInjectable,
  InjectableConstructor,
} from './injectable-constructor.ts'
import type { Scope } from './scope.ts'
import { type Key, type Token, token } from './token.ts'
import type { Any } from './utils.ts'

const DEFAULT_SCOPE = 'singleton'

export interface ClassProvider<
  K extends Key = Key,
  I extends Injectable = Any,
  C extends InjectableConstructor = InjectableConstructor,
  D extends DependencyDeclaration = DependencyDeclaration,
> {
  token: Token<K, I>
  useClass: C
  scope: Scope
  _dependencies: D
}

export interface InferableClassProvider<
  K extends Key,
  C extends InjectableConstructor,
> {
  provide: K
  useClass: C
  scope?: Scope
}

export interface ValidatableClassProvider<
  K extends Key,
  I extends Injectable,
  C extends InjectableConstructor<I>,
> {
  provide: Token<K, I>
  useClass: C
  scope?: Scope
}

function defineClassProvider<
  const K extends Key,
  C extends InjectableConstructor,
>(
  provider: InferableClassProvider<K, C>,
): ClassProvider<K, ExtractInjectable<C>, C, ExtractDependencyDeclaration<C>>

function defineClassProvider<
  const K extends Key,
  I extends Injectable,
  C extends InjectableConstructor<I>,
>(
  provider: ValidatableClassProvider<K, I, C>,
): ClassProvider<K, I, C, ExtractDependencyDeclaration<C>>

function defineClassProvider<
  const K extends Key,
  I extends Injectable,
  C extends InjectableConstructor<I>,
  D extends DependencyDeclaration,
>(
  provider: InferableClassProvider<K, C> | ValidatableClassProvider<K, I, C>,
): ClassProvider<K, I, C, D> {
  const { provide, scope = DEFAULT_SCOPE, ...rest } = provider

  return {
    token: typeof provide === 'string' ? token<I>()(provide) : provide,
    scope,
    _dependencies: undefined as unknown as D,
    ...rest,
  }
}

export { defineClassProvider }

import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { Scope } from './scope.ts'
import {
  type HasTypeToken,
  type InjectionToken,
  type PlainToken,
} from './token.ts'

const DEFAULT_SCOPE: Scope = 'singleton'

export interface ClassProvider<
  I extends Injectable = Injectable,
  C extends InjectableConstructor<I> = InjectableConstructor<I>,
> {
  provide: InjectionToken<I>
  useClass: C
  scope: Scope
}

export interface InferableClassProvider<
  I extends Injectable,
  C extends InjectableConstructor<I>,
> {
  provide: PlainToken
  useClass: C
  scope?: Scope
}

export interface ValidatableClassProvider<
  I extends Injectable,
  C extends InjectableConstructor<I>,
> {
  provide: HasTypeToken<I>
  useClass: C
  scope?: Scope
}

function defineClassProvider<
  I extends Injectable,
  C extends InjectableConstructor<I>,
>(provider: InferableClassProvider<I, C>): ClassProvider<I, C>

function defineClassProvider<
  I extends Injectable,
  C extends InjectableConstructor<I>,
>(provider: ValidatableClassProvider<I, C>): ClassProvider<I, C>

function defineClassProvider<
  I extends Injectable,
  C extends InjectableConstructor<I>,
>(
  provider: InferableClassProvider<I, C> | ValidatableClassProvider<I, C>,
): ClassProvider<I, C> {
  const { scope = DEFAULT_SCOPE, ...rest } = provider

  return { ...rest, scope }
}

export { defineClassProvider }

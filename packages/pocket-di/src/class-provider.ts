/**
 * @file ClassProvider는 injectable class를 제공하는 Provider입니다.
 * injectable class는 inject symbol을 사용해 dependency declaration을 정의할 수 있습니다.
 * 그리고 postConstruct symbol을 사용해 생성자 호출 직후 호출될 lifecycle event를 정의할 수 있습니다.
 * 만약 resolveSync()로 resolve되는 경우, postConstruct 메서드에서 Promise를 반환하면 예외를 발생시킵니다.
 * 그리고 preDestroy symbol을 사용해 destroy 전 실행할 lifecycle event를 정의할 수 있습니다.
 */

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

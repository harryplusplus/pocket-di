/**
 * @file InjectableConstructor는 injectable을 제공하는 constructor을 정의하는 type입니다.
 * inject symbol을 사용해 dependency declaration을 정의할 수 있습니다.
 * postConstruct symbol을 사용해 생성자를 직후 호출할 lifecycle event를 정의할 수 있습니다.
 * preDestroy symbol을 사용해 destroy 전 실행할 lifecycle event를 정의할 수 있습니다.
 */

import type { DependencyDeclaration } from './dependency-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { inject } from './symbols.ts'
import type { Constructor } from './utils.ts'

export interface InjectableConstructor<
  I extends Injectable = Injectable,
  D extends DependencyDeclaration = DependencyDeclaration,
> extends Constructor<I> {
  [inject]?: D
}

export type ExtractDependencyDeclaration<T extends InjectableConstructor> =
  T extends InjectableConstructor<infer _, infer D> ? D : never

/**
 * @file InjectableConstructor defines a constructor that provides an injectable
 * Use inject symbol to define dependency declaration
 * Use postConstruct symbol to define lifecycle event called after instantiation
 * Use preDestroy symbol to define lifecycle event called before destruction
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

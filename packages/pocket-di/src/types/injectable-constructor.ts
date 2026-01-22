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

export type ExtractInjectable<T extends InjectableConstructor> =
  T extends InjectableConstructor<infer I> ? I : never

export type ExtractDependencyDeclaration<T extends InjectableConstructor> =
  T extends InjectableConstructor<infer _, infer D> ? D : never

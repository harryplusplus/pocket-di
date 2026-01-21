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

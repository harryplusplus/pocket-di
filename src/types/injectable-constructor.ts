import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import type { inject } from './symbols.ts'
import type { Constructor } from './utils.ts'

export interface InjectableConstructor<
  I extends Injectable = Injectable,
  ID extends InjectDeclaration = InjectDeclaration,
> extends Constructor<I> {
  [inject]?: ID
}

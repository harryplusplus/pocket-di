import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import { type TypedToken } from './token.ts'

export type DependencyDeclaration = Record<string, DependencyDeclarationItem>

export type DependencyDeclarationItem<I extends Injectable = Injectable> =
  | TypedToken<I>
  | InjectableConstructor<I, DependencyDeclaration>

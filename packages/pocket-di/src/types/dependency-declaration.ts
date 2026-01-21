import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { TypedToken } from './token.ts'

export type DependencyDeclaration =
  | TupleDependencyDeclaration
  | RecordDependencyDeclaration

export type TupleDependencyDeclaration = readonly DependencyDeclarationItem[]

export type RecordDependencyDeclaration = Record<
  string,
  DependencyDeclarationItem
>

export function isTupleDependencyDeclaration(
  x: DependencyDeclaration,
): x is TupleDependencyDeclaration {
  return Array.isArray(x)
}

export function isRecordDependencyDeclaration(
  x: DependencyDeclaration,
): x is RecordDependencyDeclaration {
  return !Array.isArray(x)
}

export type DependencyDeclarationItem<I extends Injectable = Injectable> =
  | TypedToken<I>
  | InjectableConstructor<I, DependencyDeclaration>

export function isTypedTokenDependencyDeclarationItem(
  x: DependencyDeclarationItem,
): x is TypedToken {
  return typeof x === 'string' || typeof x === 'symbol'
}

export function isInjectableConstructorDependencyDeclarationItem(
  x: DependencyDeclarationItem,
): x is InjectableConstructor {
  return typeof x === 'function'
}

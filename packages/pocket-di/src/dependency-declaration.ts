/**
 * @file Types and utility types for dependency declaration
 */

import type { Injectable } from './injectable.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { inject } from './symbols.ts'
import type { HasTypeToken } from './token.ts'

export type DependencyDeclaration = Record<string, HasTypeToken>

export type ExtractDependencies<D extends DependencyDeclaration> = {
  [K in keyof D]: D[K] extends HasTypeToken<infer I> ? I : never
}

export type AnyDependencies = Record<string, Injectable>

export type InferConstructorParameters<IC extends InjectableConstructor> =
  IC extends { [inject]?: infer D extends DependencyDeclaration }
    ? ExtractDependencies<D>
    : never

export type InferCP<IC extends InjectableConstructor> =
  InferConstructorParameters<IC>

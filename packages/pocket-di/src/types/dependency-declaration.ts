import type { Injectable } from './injectable.ts'
import type { Token } from './token.ts'

export type DependencyDeclaration = Record<string, Token>

export type ExtractDependencies<D extends DependencyDeclaration> = {
  [K in keyof D]: D[K] extends Token<infer _, infer I> ? I : never
}

export type AnyDependencies = Record<string, Injectable>

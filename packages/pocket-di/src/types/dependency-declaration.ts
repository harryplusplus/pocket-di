import type { ExtractType, Token } from './token.ts'

export type DependencyDeclaration = Record<string, Token>

export type ExtractDependencies<D extends DependencyDeclaration> = {
  [K in keyof D]: D[K] extends ExtractType<infer I> ? I : never
}

import type { ClassProvider } from './class-provider.ts'
import type { FactoryProvider } from './factory-provider.ts'
import type { InjectDeclaration } from './inject-declaration.ts'
import type { Injectable } from './injectable.ts'
import { type InferableToken, type InferInjectable } from './token.ts'
import type { ValueProvider } from './value-provider.ts'

export type Provider<
  T extends InferableToken = InferableToken,
  I extends Injectable = InferInjectable<T>,
  C extends I = I,
  D extends InjectDeclaration = InjectDeclaration,
> =
  | ValueProvider<T, I>
  | ClassProvider<T, I, C, D>
  | FactoryProvider<T, I, C, D>

export function isValueProvider(x: Provider): x is ValueProvider {
  return 'useValue' in x
}

export function isClassProvider(x: Provider): x is ClassProvider {
  return 'useClass' in x
}

export function isFactoryProvider(x: Provider): x is FactoryProvider {
  return 'useFactory' in x
}

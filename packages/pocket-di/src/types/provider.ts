import type { ClassProvider } from './class-provider.ts'
import type { FactoryProvider } from './factory-provider.ts'
import type { InjectableConstructor } from './injectable-constructor.ts'
import type { ValueProvider } from './value-provider.ts'

export type Provider =
  | ValueProvider
  | ClassProvider
  | FactoryProvider
  | InjectableConstructor

export function isValueProvider(provider: Provider): provider is ValueProvider {
  return 'useValue' in provider
}

export function isClassProvider(provider: Provider): provider is ClassProvider {
  return 'useClass' in provider
}

export function isFactoryProvider(
  provider: Provider,
): provider is FactoryProvider {
  return 'useFactory' in provider
}

export function isConstructorProvider(
  provider: Provider,
): provider is InjectableConstructor {
  return typeof provider === 'function'
}

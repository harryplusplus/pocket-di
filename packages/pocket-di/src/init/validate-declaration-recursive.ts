import type { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import { classProviderToDeclaration } from '../types/class-provider.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import { factoryProviderToDeclaration } from '../types/factory-provider.ts'
import {
  isClassProvider,
  isFactoryProvider,
  type Provider,
} from '../types/provider.ts'
import { validateDeclaration } from './validate-declaration.ts'

export function validateDeclarationRecursive(input: {
  provider: Provider
  providerRegistry: ProviderRegistry
  checker: CircularDependencyChecker
}): void {
  const { provider, providerRegistry, checker } = input

  if (isClassProvider(provider)) {
    validateDeclaration({
      token: provider.provide,
      declaration: classProviderToDeclaration(provider),
      providerRegistry,
      className: provider.useClass.name,
      checker,
    })
  } else if (isFactoryProvider(provider)) {
    validateDeclaration({
      token: provider.provide,
      declaration: factoryProviderToDeclaration(provider),
      providerRegistry,
      className: null,
      checker,
    })
  }
}

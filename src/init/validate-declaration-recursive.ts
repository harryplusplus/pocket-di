import type { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import {
  classProviderToDeclaration,
  factoryProviderToDeclaration,
  isClassProvider,
  isValueProvider,
  type Provider,
} from '../types/provider.ts'
import type { FindProvider } from './find-provider.ts'
import { validateDeclaration } from './validate-declaration.ts'

export function validateDeclarationRecursive(input: {
  provider: Provider
  findProvider: FindProvider
  checker: CircularDependencyChecker
}): void {
  const { provider, findProvider, checker } = input

  if (isValueProvider(provider)) {
    // noop

    return
  }

  if (isClassProvider(provider)) {
    validateDeclaration({
      token: provider.provide,
      declaration: classProviderToDeclaration(provider),
      findProvider,
      className: provider.useClass.name,
      checker,
    })

    return
  }

  validateDeclaration({
    token: provider.provide,
    declaration: factoryProviderToDeclaration(provider),
    findProvider,
    className: null,
    checker,
  })
}

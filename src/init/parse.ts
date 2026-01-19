import { createCircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { ContainerImpl, Providers } from '../container.ts'
import type { AnyProvidable } from '../types/providable.ts'
import { createFindProvider } from './find-provider.ts'
import { parseProviders } from './parse-providers.ts'
import { validateDeclarationRecursive } from './validate-declaration-recursive.ts'

export function parse(input: {
  providers: AnyProvidable[]
  parent: ContainerImpl | null
  override: boolean
}): {
  providers: Providers
  parent: ContainerImpl | null
} {
  const { parent, override } = input

  const providers = parseProviders({
    parent,
    override,
    inputProviders: input.providers,
  })

  const findProvider = createFindProvider({
    providers,
    parent,
  })

  for (const provider of providers.values()) {
    const checker = createCircularDependencyChecker()
    checker.push(provider.provide)

    validateDeclarationRecursive({
      provider,
      findProvider,
      checker,
    })
  }

  return {
    providers,
    parent,
  }
}

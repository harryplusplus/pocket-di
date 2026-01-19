import { createCircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { ContainerContext, Providers } from '../container-context.ts'
import type { ContainerContextOptions } from '../types/container-options.ts'
import { createFindProvider } from './find-provider.ts'
import { parseProviders } from './parse-providers.ts'
import { validateDeclarationRecursive } from './validate-declaration-recursive.ts'

export function parse(input: ContainerContextOptions): {
  providers: Providers
  parent: ContainerContext | null
} {
  const { parent = null, override = false } = input

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

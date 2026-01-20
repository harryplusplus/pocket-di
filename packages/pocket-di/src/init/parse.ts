import { CircularDependencyChecker } from '../circular-dependency-checker.ts'
import type { ProviderRegistry } from '../types/compositions.ts'
import type { AnyProvidable } from '../types/providable.ts'
import { parseProviderRegistry } from './parse-provider-registry.ts'
import { validateDeclarationRecursive } from './validate-declaration-recursive.ts'

export function parse(input: {
  providables: AnyProvidable[]
  parentProviderRegistry: ProviderRegistry | null
  override: boolean
}): ProviderRegistry {
  const { providables, parentProviderRegistry, override } = input

  const providerRegistry = parseProviderRegistry({
    parentProviderRegistry,
    override,
    providables,
  })

  for (const provider of providerRegistry.map.values()) {
    const checker = new CircularDependencyChecker()
    checker.push(provider.provide)

    validateDeclarationRecursive({ provider, providerRegistry, checker })
  }

  return providerRegistry
}

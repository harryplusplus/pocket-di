import type {
  DependencyRecord,
  ProviderHasDependencies,
} from '../types/compositions.ts'
import type { Injectable } from '../types/injectable.ts'
import { isPostConstructable } from '../types/lifecycle-events.ts'
import { isClassProvider } from '../types/provider.ts'
import { postConstruct } from '../types/symbols.ts'

export async function resolveInstanceAsync(input: {
  provider: ProviderHasDependencies
  dependencies: DependencyRecord
}): Promise<Injectable> {
  const { provider, dependencies } = input

  if (isClassProvider(provider)) {
    const { useClass } = provider
    const instance = new useClass(dependencies)

    if (isPostConstructable(instance)) {
      await instance[postConstruct]()
    }

    return instance
  }

  const { useFactory } = provider
  return await useFactory(dependencies)
}

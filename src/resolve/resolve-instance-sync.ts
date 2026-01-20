import type {
  DependencyTupleOrRecord,
  ProviderHasDependencies,
} from '../types/compositions.ts'
import type { Injectable } from '../types/injectable.ts'
import { isPostConstructable } from '../types/lifecycle-events.ts'
import { isClassProvider } from '../types/provider.ts'
import { postConstruct } from '../types/symbols.ts'
import { tokenToString, type InjectionToken } from '../types/token.ts'

export async function resolveInstanceSync(input: {
  token: InjectionToken
  provider: ProviderHasDependencies
  dependencies: DependencyTupleOrRecord
}): Promise<Injectable> {
  const { token, provider, dependencies } = input

  if (isClassProvider(provider)) {
    const { useClass } = provider
    const instance = new useClass(dependencies)

    if (isPostConstructable(instance)) {
      const output = instance[postConstruct]()
      if (output instanceof Promise) {
        throw new Error(
          `Cannot resolve "${tokenToString(token)}" (${useClass.name}) synchronously: postConstruct returns Promise.`,
        )
      }
    }

    return instance
  }

  const { useFactory } = provider
  const instance = await useFactory(dependencies)
  if (instance instanceof Promise) {
    throw new Error(
      `Cannot resolve "${tokenToString(token)}" synchronously: useFactory returns Promise.`,
    )
  }

  return instance
}

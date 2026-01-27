import type { AnyDependencies } from '../types/dependency-declaration.ts'
import type { Injectable } from '../types/injectable.ts'
import { isPostConstructable } from '../types/lifecycle-events.ts'
import { isClassProvider } from '../types/provider.ts'
import { postConstruct } from '../types/symbols.ts'
import type { Key } from '../types/token.ts'
import {
  CommonResolver,
  type ProviderHasDependencies,
  providerToDeclaration,
} from './common-resolver.ts'
import type { ContainerImpl } from './impl.ts'

export class ContainerSyncResolver {
  private readonly impl: ContainerImpl
  private readonly common: CommonResolver

  constructor(impl: ContainerImpl) {
    this.impl = impl
    this.common = new CommonResolver(impl)
  }

  resolve(key: Key): Injectable {
    const { common } = this

    const output = common.resolveInstanceOrProvider(key)
    if (output.kind === 'instance') {
      return output.instance
    }

    const { provider } = output

    const dependencies = this.resolveDependencies(provider)
    const instance = this.resolveInstance({ provider, dependencies })

    common.updateSingletonRegistry({ provider, instance })

    return instance
  }

  resolveDependencies(provider: ProviderHasDependencies): AnyDependencies {
    const declaration = providerToDeclaration(provider)
    const dependencies: AnyDependencies = {}
    for (const [name, token] of Object.entries(declaration)) {
      const instance = this.resolve(token.key)

      dependencies[name] = instance
    }

    return dependencies
  }

  resolveInstance(input: {
    provider: ProviderHasDependencies
    dependencies: AnyDependencies
  }): Injectable {
    const { provider, dependencies } = input
    const { key } = provider.token

    if (isClassProvider(provider)) {
      const { useClass } = provider
      const instance = new useClass(dependencies)

      if (isPostConstructable(instance)) {
        const output = instance[postConstruct]()
        if (output instanceof Promise) {
          throw new Error(
            `Cannot resolve "${key}" (${useClass.name}) synchronously: postConstruct returns Promise.`,
          )
        }
      }

      return instance
    }

    const { useFactory } = provider
    const instance = useFactory(dependencies)
    if (instance instanceof Promise) {
      throw new Error(
        `Cannot resolve "${key}" synchronously: useFactory returns Promise.`,
      )
    }

    return instance
  }
}

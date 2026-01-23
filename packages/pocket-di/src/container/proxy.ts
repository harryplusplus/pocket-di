import type {
  Container,
  ContainerType,
  ExtractContainerType,
} from '../types/container.ts'
import type { ContainerOptions } from '../types/container-options.ts'
import type { Providers } from '../types/provider.ts'
import { ContainerImpl } from './impl.ts'

const SKIPS = new Set(['then', 'catch', 'finally'])

export function createContainerProxy<T extends ContainerType>(
  impl: ContainerImpl<T>,
): Container<T> {
  return new Proxy(impl, {
    get: (target, key) => {
      if (typeof key !== 'string' || SKIPS.has(key)) {
        return undefined
      }

      if (target.$isValidKey(key)) {
        return target.$getOrCreateHandler(key)
      }

      return target[key as keyof ContainerImpl<T>]
    },
  }) as Container<T>
}

export function createContainer<const Ps extends Providers>(
  options: ContainerOptions<Ps>,
): Container<ExtractContainerType<Ps>> {
  const impl = new ContainerImpl<ExtractContainerType<Ps>>(options)

  return createContainerProxy(impl)
}

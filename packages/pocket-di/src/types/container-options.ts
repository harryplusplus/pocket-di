import type { ContainerImpl } from '../container.ts'
import type { AnyProvidable } from './providable.ts'

export interface ContainerOptions {
  /** Array of providers or injectable constructors to register */
  providers: AnyProvidable[]
}

export interface ChildContainerOptions {
  /** Array of providers or injectable constructors to register */
  providers: AnyProvidable[]

  /** Allow overriding providers from parent container */
  override?: boolean
}

export interface ContainerImplOptions {
  providers: AnyProvidable[]
  parent?: ContainerImpl | null
  override?: boolean
}

export function fillContainerImplOptions(
  options: ContainerImplOptions,
): Omit<ContainerImplOptions, 'parent' | 'override'> &
  Pick<Required<ContainerImplOptions>, 'parent' | 'override'> {
  return { parent: null, override: false, ...options }
}

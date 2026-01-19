import type { ContainerContext } from '../container-context.ts'
import type { Providable } from './providable.ts'
import type { Any } from './utils.ts'

export interface ContainerOptions {
  /** Array of providers or injectable constructors to register */
  providers: Providable<Any, Any, Any>[]
}

export interface ChildContainerOptions {
  /** Array of providers or injectable constructors to register */
  providers: Providable<Any, Any, Any>[]

  /** Allow overriding providers from parent container */
  override?: boolean
}

export interface ContainerContextOptions {
  providers: Providable<Any, Any, Any>[]
  parent?: ContainerContext | null
  override?: boolean
}

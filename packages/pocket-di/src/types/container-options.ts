import type { ContainerImpl } from '../container/impl.ts'
import type { Providers } from './provider.ts'

export interface ContainerOptions<Ps extends Providers> {
  providers: Ps
}

export interface ChildContainerOptions<Ps extends Providers> {
  providers: Ps
  override?: boolean
}

export interface ContainerImplOptions {
  providers: Providers
  override?: boolean
  parent?: ContainerImpl
}

export function fillContainerImplOptions(options: ContainerImplOptions) {
  const { parent = null, override = false, ...rest } = options

  return { ...rest, parent, override }
}

export type FilledContainerImplOptions = ReturnType<
  typeof fillContainerImplOptions
>

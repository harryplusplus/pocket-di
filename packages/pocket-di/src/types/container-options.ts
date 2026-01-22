import type { ContainerContext } from '../container-context.ts'
import type { Providers } from './provider.ts'

export interface ContainerOptions<Ps extends Providers> {
  providers: Ps
}

export interface ChildContainerOptions<Ps extends Providers> {
  providers: Ps
  override?: boolean
}

export interface ContextOptions {
  providers: Providers
  override?: boolean
  parent?: ContainerContext
}

export function fillContextOptions(options: ContextOptions) {
  const { parent = null, override = false, ...rest } = options

  return { ...rest, parent, override }
}

export type FilledContextOptions = ReturnType<typeof fillContextOptions>

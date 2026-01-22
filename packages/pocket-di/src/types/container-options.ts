import type { Providers } from './provider.ts'

export interface ContainerOptions<Ps extends Providers> {
  providers: Ps
}

export interface ChildContainerOptions<Ps extends Providers> {
  providers: Ps
  override?: boolean
}

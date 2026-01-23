import type { ContainerAsyncResolver } from '../container/async-resolver.ts'
import type { ContainerHandler } from '../container/handler.ts'
import type { ContainerImpl } from '../container/impl.ts'
import type { ContainerSyncResolver } from '../container/sync-resolver.ts'
import type { Registry, RegistryFindOptions } from '../registry.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { Key } from './token.ts'

export interface ContainerContext {
  readonly children: Set<ContainerImpl>
  parent: ContainerImpl | null
  readonly validKeySet: ValidKeySet
  readonly providerRegistry: ProviderRegistry
  readonly handlerRegistry: HandlerRegistry
  readonly singletonRegistry: SingletonRegistry
  readonly asyncResolver: ContainerAsyncResolver
  readonly syncResolver: ContainerSyncResolver
}

export type ValidKeySet = Set<Key>
export type HandlerRegistry = Registry<Key, ContainerHandler>
export type SingletonRegistry = Registry<Key, Injectable>
export type ProviderRegistry = Registry<Key, Provider>
export type HasSingletonOptions = RegistryFindOptions

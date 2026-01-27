/**
 * @file State owned and used by container
 */

import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { ConcreteProvider } from './provider-utils.ts'
import type { KeyToken } from './token.ts'

/**
 * State owned and used by container
 */
export interface ContainerContext {
  readonly parent?: ContainerImpl
  readonly children: Set<ContainerImpl>
  readonly providerMap: Map<KeyToken, ConcreteProvider>
  readonly singletonMap: Map<KeyToken, Injectable>
}

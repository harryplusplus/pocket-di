/**
 * @file State owned and used by container
 */

import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { NormalizedProvider } from './normalized-provider.ts'
import type { InjectionToken } from './token.ts'

/**
 * State owned and used by container
 */
export interface ContainerContext {
  readonly parent?: ContainerImpl
  readonly children: Set<ContainerImpl>
  readonly providerMap: Map<InjectionToken, NormalizedProvider>
  readonly singletonMap: Map<InjectionToken, Injectable>
}

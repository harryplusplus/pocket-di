/**
 * @file container에서 소유하고 사용하는 상태을 정의하는 interface입니다.
 */

import type { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { NormalizedProvider } from './normalized-provider.ts'
import type { InjectionToken } from './token.ts'

/**
 * container에서 소유하고 사용하는 상태 interface입니다.
 */
export interface ContainerContext {
  readonly parent?: ContainerImpl
  readonly children: Set<ContainerImpl>
  readonly providerMap: Map<InjectionToken, NormalizedProvider>
  readonly singletonMap: Map<InjectionToken, Injectable>
}

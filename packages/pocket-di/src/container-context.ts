/**
 * @file container에서 소유하고 사용하는 상태을 정의하는 interface입니다.
 */

import type { ContainerImpl } from './container-impl.ts'

/**
 * container에서 소유하고 사용하는 상태 interface입니다.
 */
export interface ContainerContext {
  readonly parent?: ContainerImpl
  readonly children: Set<ContainerImpl>
}

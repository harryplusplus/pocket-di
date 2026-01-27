/**
 * @file 컨테이너 공개 API입니다.
 */

import { ContainerImpl } from './container-impl.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { InjectionToken } from './token.ts'

export interface CreateChildOptions {
  /**
   * 자식 컨테이너에서 사용될 provider들을 등록합니다.
   */
  providers: Provider[]

  /**
   * 부모 컨테이너의 provider를 override할 지 여부를 정의합니다.
   * false일 경우, parent에 등록되어 있는 같은 토큰값의 provider가 있을 경우 예외를 발생시킵니다.
   * @default false
   * @todo
   */
  override?: boolean
}

export interface Container {
  /**
   * 이 컨테이너와 그 모든 자식들을 파괴합니다.
   */
  destroy(): Promise<void>

  /**
   * 자식 컨테이너를 생성합니다.
   */
  createChild(options: CreateChildOptions): Container

  /**
   * injectable instance를 resolve하고 반환합니다.
   * singleton provider의 token value일 경우, 이미 있는 singleton을 재사용합니다.
   * 만약 transient provider의 token value일 경우, 매번 새로운 instance를 반환합니다.
   * dependencies도 재귀적으로 resolve됩니다.
   */
  resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I>

  /**
   * injectable instance를 resolve하고 반환합니다.
   * 만약 class instance가 postCreate을 구현하는 경우, postCreate을 실행합니다. 이 때, Promise를 반환하면 예외를 발생시킵니다.
   * 만약 factory provider의 useFactory가 Promise를 반환하는 경우, 예외를 발생시킵니다.
   * dependencies도 재귀적으로 resolve되기 때문에 모든 dependencies도 이미 resolve되어 있거나 Promise를 반환하면 안됩니다.
   */
  resolveSync<I extends Injectable>(token: InjectionToken<I>): I

  /**
   * singleton instance가 있는지 조회합니다.
   */
  hasSingleton(token: InjectionToken): boolean

  /**
   * singleton instance를 반환합니다. 없을 경우 예외를 발생시킵니다.
   */
  get<I extends Injectable>(token: InjectionToken<I>): I
}

export interface CreateContainerOptions {
  /**
   * 컨테이너에서 사용할 provider들을 등록합니다.
   */
  providers: Provider[]
}

/**
 * Create a new DI container
 */
export function createContainer(options: CreateContainerOptions): Container {
  return new ContainerImpl(options)
}

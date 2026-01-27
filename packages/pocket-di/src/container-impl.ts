import { AsyncLock } from './async-lock.ts'
import type { Container, CreateChildOptions } from './container.ts'
import type { ContainerContext } from './container-context.ts'
import type { Injectable } from './injectable.ts'
import type { Provider } from './provider.ts'
import type { InjectionToken } from './token.ts'

/**
 * Internal options for creating a container
 */
interface ContainerImplOptions {
  providers: Provider[]
  parent?: ContainerImpl
}

// TODO: ContainerImpl의 모든 메서드는 다른 클래스에게 행동을 위임합니다.
// 이 때, context를 공유합니다.
// 따라서, 각 메서드는 파괴 검사, lock 검사를 제외하고 1~3 줄만 있어야 합니다.
// 각 클래스에게 위임하는 이유는 구현 및 테스트 용이성을 위해서입니다.
export class ContainerImpl implements Container {
  readonly lock = new AsyncLock()
  private destroyed = false
  readonly context: ContainerContext

  constructor(options: ContainerImplOptions) {
    const { providers, parent } = options

    // TODO: context를 초기화합니다.
    // TODO: parent에 자식으로 본인을 추가합니다.
    // TODO: provider들의 dependency declaration을 검사합니다. resolve 가능 유무를 확인해야 합니다.
  }

  async destroy(): Promise<void> {
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    await this.lock.acquire(async () => {
      if (this.destroyed) {
        return
      }

      // TODO: 자식을 역순으로 파괴합니다.
      // TODO: 본인 singleton을 역순으로 파괴합니다. 파괴하기 전에 preDestroy를 호출합니다.
      // TODO: context를 초기화합니다.
    })
  }

  createChild(options: CreateChildOptions): Container {
    return new ContainerImpl({ ...options, parent: this })
  }

  async resolve<I extends Injectable>(token: InjectionToken<I>): Promise<I> {
    // TODO: container 파괴유무 검사 메서드 호출
    // TODO: 구현
  }

  resolveSync<I extends Injectable>(token: InjectionToken<I>): I {
    // TODO: container 파괴유무 검사 메서드 호출
    // TODO: 구현
  }

  hasSingleton(token: InjectionToken): boolean {
    // TODO: 구현
  }

  get<I extends Injectable>(token: InjectionToken<I>): I {
    // TODO: 구현
  }
}

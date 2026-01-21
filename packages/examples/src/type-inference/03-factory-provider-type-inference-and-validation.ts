import {
  createContainer,
  defineFactoryProvider,
  type PlainToken,
  token,
} from 'pocket-di'

// Dependency class.
class Foo {
  fooFoo() {
    console.log('[Foo] fooFoo()')
  }
}

/******************************************************************************
 * Infer types from a factory to create a type-bound injection provider and
 * token.
 ******************************************************************************/

const barProvider = defineFactoryProvider({
  // 플레인 문자열을 인젝션 토큰으로 사용하면 useFactory의 반환 타입으로부터 추론됩니다.
  provide: 'bar',

  // 의존성 선언 객체를 정의합니다.
  inject: { foo: Foo },

  useFactory: async ({ foo }) => {
    const bar = {
      fooFoo: () => {
        console.log('[Bar] fooFoo()')
        foo.fooFoo()
      },
      close: () => {
        console.log('[Bar] close()')
      },
    }

    // 비동기 초기화 시뮬레이션
    await Promise.resolve()

    return bar
  },

  // container.destroy()에서 호출됩니다.
  preDestroy: (instance) => {
    instance.close()
  },
})

const barToken = barProvider.provide
/** type: TypedToken<{ fooFoo: () => void; close: () => void }> */

const container = createContainer({ providers: [barProvider, Foo] })

const bar = await container.resolve(barToken)
bar.fooFoo()
// [Bar] fooFoo()
// [Foo] fooFoo()

await container.destroy()
// [Bar] close()

interface Baz {
  bazBaz(): void
}

const bazToken = token<Baz>('baz')
/** type: TypedToken<Baz> */

const bazProvider = defineFactoryProvider({
  provide: bazToken,
  useFactory: () => {
    return {}
  },
})

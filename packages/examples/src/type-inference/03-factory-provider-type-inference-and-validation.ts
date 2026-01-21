import { createContainer, defineFactoryProvider, token } from 'pocket-di'

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

const _bazToken = token<Baz>('baz')
/** type: TypedToken<Baz> */

// 추론 가능한 토큰 (typed token or class)을 provide에 사용할 경우, useFactory의 반환
// 타입을 검증합니다.
// const bazProvider = defineFactoryProvider({
//   provide: _bazToken,
//   useFactory: () => {
//     // const baz: Baz = {
//     //   bazBaz: () => {
//     //     console.log('[Baz] bazBaz()')
//     //   },
//     // }
//     // return baz
//     return {}
//   },
// })

/*
No overload matches this call.
  Overload 1 of 2, '(provider: FactoryProviderInput<PlainToken, {}, {}, 
  InjectDeclaration>): FactoryProvider<TypedToken<{}>, {}, {}, 
  InjectDeclaration>', gave the following error.
    Type 'TypedToken<Baz>' is not assignable to type 'PlainToken'.
  Overload 2 of 2, '(provider: FactoryProviderInput<TypedToken<Baz>, Baz, Baz, 
  InjectDeclaration>): FactoryProvider<TypedToken<Baz>, Baz, Baz, 
  InjectDeclaration>', gave the following error.
    Type '() => {}' is not assignable to type 
    '((dependencies: Dependencies<InjectDeclaration>) => MaybePromise<Baz>) | 
    ((dependencies: Dependencies<InjectDeclaration>) => MaybePromise<...>)'.
      Type '() => {}' is not assignable to type 
      '(dependencies: Dependencies<InjectDeclaration>) => MaybePromise<Baz>'.
        Type '{}' is not assignable to type 'MaybePromise<Baz>'.ts(2769)
*/

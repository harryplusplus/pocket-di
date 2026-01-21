// packages/examples/src/type-inference/04-value-provider.ts

import {
  createContainer,
  defineValueProvider,
  type InferConstructorParams,
  inject,
} from 'pocket-di'

/******************************************************************************
 * Infer types from a value to create a type-bound injection provider and
 * token.
 ******************************************************************************/

const fooProvider = defineValueProvider({ provide: 'foo', useValue: 'FOO!' })
/** type: ValueProvider<TypedToken<string>, string, string> */

const fooToken = fooProvider.provide
/** type: TypedToken<string> */

type BarParams = InferConstructorParams<typeof Bar>

class Bar {
  static [inject] = { foo: fooToken }

  constructor({ foo }: BarParams) {
    console.log(`[Bar] ${foo}`)
  }
}

const container = createContainer({ providers: [fooProvider, Bar] })

await container.resolve(Bar)
// [Bar] FOO!

await container.destroy()

/******************************************************************************
 * Validate the provided value type using a type-bound token.
 ******************************************************************************/

// When using an inferable token (typed token or class) in provide, the
// value type is validated.

// const invalidProvider = defineValueProvider({ provide: fooToken, useValue:
//   {} })

/*
No overload matches this call.
  Overload 1 of 2, '(provider: ValueProviderInput<PlainToken, {}, {}>): 
  ValueProvider<TypedToken<{}>, {}, {}>', gave the following error.
    Type 'TypedToken<string>' is not assignable to type 'PlainToken'.
  Overload 2 of 2, '(provider: ValueProviderInput<TypedToken<string>, string, 
  string>): ValueProvider<TypedToken<string>, string, string>', gave the 
  following error.
    Type '{}' is not assignable to type 'string'.ts(2769)
*/

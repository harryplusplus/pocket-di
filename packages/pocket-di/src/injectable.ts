/**
 * @file Injectable 타입은 container에서 사용할 수 있는 injectable type을 정의합니다.
 * undefined, null 값은 injectable 타입으로 사용될 수 없습니다.
 */

export type Injectable = NonNullable<unknown>

/**
 * @file Scope는 singleton, transient 두 가지 kind가 있습니다.
 * singleton의 경우 container의 lifecycle 동안 resolve된 후 재사용됩니다.
 * transient의 경우 매 resolve시 새로운 instance를 생성합니다.
 */

export type Singleton = 'singleton'

export type Transient = 'transient'

export type Scope = Singleton | Transient

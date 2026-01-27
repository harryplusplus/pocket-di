/**
 * @file Scope has two kinds: singleton and transient
 * singleton: Reuses resolved instance during container lifecycle
 * transient: Creates new instance on every resolve
 */

export type Singleton = 'singleton'

export type Transient = 'transient'

export type Scope = Singleton | Transient

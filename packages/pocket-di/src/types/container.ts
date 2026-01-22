import type { ContainerImpl } from '../container-impl.ts'
import type { Handler } from './handler.ts'
import type { TypeInfo } from './token.ts'

export type ContainerPublicMethods<T extends TypeInfo = TypeInfo> = Pick<
  ContainerImpl<T>,
  '$createChild' | '$destroy'
>

export type ContainerHandlers<T extends TypeInfo> = {
  [K in keyof T]: Handler<T[K]>
}

export type Container<T extends TypeInfo = TypeInfo> =
  ContainerPublicMethods<T> & ContainerHandlers<T>

import type { ContainerImpl } from '../container.ts'
import { destroyChildren } from './destroy-children.ts'
import { destroySingletons } from './destroy-singletons.ts'

export async function destroyContainer(input: {
  container: ContainerImpl
}): Promise<void> {
  const { container } = input
  const { children, singletons, providers, parent } = container

  await destroyChildren({
    children,
  })

  await destroySingletons({
    singletons,
    providers,
    parent,
  })
}

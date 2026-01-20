import type { ContainerImpl } from '../container.ts'

export async function destroyChildren(context: {
  children: ContainerImpl[]
}): Promise<void> {
  const { children } = context

  for (let i = children.length - 1; i >= 0; i--) {
    try {
      await children[i].destroy()
    } catch (_e) {
      // noop
    }
  }

  children.length = 0
}

import type { ContainerImpl } from '../container.ts'

export async function destroyChildren(input: {
  children: ContainerImpl[]
}): Promise<void> {
  const { children } = input

  for (let i = children.length - 1; i >= 0; i--) {
    try {
      await children[i].destroy()
    } catch (_e) {
      // noop
    }
  }
}

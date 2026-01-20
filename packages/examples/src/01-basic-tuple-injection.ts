import { createContainer, type InferDependencies, inject } from 'pocket-di'

class LoggerService {
  log(message: string) {
    console.log(`[LOG] ${message}`)
  }
}

class DatabaseService {
  query(sql: string) {
    console.log(`[DB] Executing: ${sql}`)
    return { rows: [] }
  }
}

class UserService {
  static [inject] = [LoggerService, DatabaseService] as const

  constructor(deps: InferDependencies<typeof UserService>) {
    const [logger, database] = deps

    logger.log('UserService created')
    const result = database.query('SELECT * FROM users')
    console.log('Query result:', result)
  }

  getUsers() {
    return ['Alice', 'Bob']
  }
}

export type UserServiceDeps = InferDependencies<typeof UserService>
// Types: [LoggerService, DatabaseService]

async function main() {
  console.log('=== Tuple Injection Example ===\n')

  const container = createContainer({
    providers: [LoggerService, DatabaseService, UserService],
  })

  console.log('--- Async resolve ---')
  const userService1 = await container.resolve(UserService)
  console.log('Users:', userService1.getUsers())

  console.log('\n--- Sync resolve ---')
  const userService2 = container.resolveSync(UserService)
  console.log('Users:', userService2.getUsers())

  console.log('\nSame instance?', userService1 === userService2)

  await container.destroy()
}

void main()

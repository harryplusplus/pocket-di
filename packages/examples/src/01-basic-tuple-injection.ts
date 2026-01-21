// packages/examples/src/01-basic-tuple-injection.ts

import { createContainer, type InferConstructorParams, inject } from 'pocket-di'

// Basic service without dependencies
class LoggerService {
  log(message: string) {
    console.log(`[LOG] ${message}`)
  }
}

// Another basic service without dependencies
class DatabaseService {
  query(sql: string) {
    console.log(`[DB] Executing: ${sql}`)
    return { rows: [] }
  }
}

// Tuple-style dependency injection
class UserService {
  // Declare dependencies using inject symbol (tuple array)
  static [inject] = [LoggerService, DatabaseService] as const

  // Type inference works automatically
  constructor(deps: InferConstructorParams<typeof UserService>) {
    const [logger, database] = deps

    logger.log('UserService created')
    const result = database.query('SELECT * FROM users')
    console.log('Query result:', result)
  }

  getUsers() {
    return ['Alice', 'Bob']
  }
}

// Type check (not used in practice, just for demonstration)
export type UserServiceDeps = InferConstructorParams<typeof UserService>
// Type: [LoggerService, DatabaseService]

async function main() {
  console.log('=== Tuple Injection Example ===\n')

  // Create container
  const container = createContainer({
    providers: [LoggerService, DatabaseService, UserService],
  })

  // Async resolve
  console.log('--- Async resolve ---')
  const userService1 = await container.resolve(UserService)
  console.log('Users:', userService1.getUsers())

  console.log('\n--- Sync resolve ---')
  // Sync resolve
  const userService2 = container.resolveSync(UserService)
  console.log('Users:', userService2.getUsers())

  // Same instance because it's a singleton
  console.log('\nSame instance?', userService1 === userService2)

  await container.destroy()
}

void main()

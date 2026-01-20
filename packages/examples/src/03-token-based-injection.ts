import { createContainer, inject, token } from 'pocket-di'

interface IEmailService {
  send(to: string, message: string): void
}

interface INotificationService {
  notify(userId: string, text: string): void
}

const EMAIL_SERVICE = token<IEmailService>('EMAIL_SERVICE')
const NOTIFICATION_SERVICE = token<INotificationService>('NOTIFICATION_SERVICE')
const API_KEY = token<string>('API_KEY')

class EmailServiceImpl implements IEmailService {
  send(to: string, message: string) {
    console.log(`[EMAIL] To: ${to}, Message: ${message}`)
  }
}

class NotificationServiceImpl implements INotificationService {
  static [inject] = [EMAIL_SERVICE] as const

  constructor(deps: [IEmailService]) {
    const [emailService] = deps
    emailService.send('admin@example.com', 'Notification service started')
  }

  notify(userId: string, text: string) {
    console.log(`[NOTIFICATION] User ${userId}: ${text}`)
  }
}

async function main() {
  console.log('=== Token-based Injection Example ===\n')

  const container = createContainer({
    providers: [
      // useValue
      { provide: API_KEY, useValue: 'secret-api-key-12345' },

      // useFactory
      {
        provide: EMAIL_SERVICE,
        useFactory: () => {
          console.log('Creating EmailService via factory')
          return new EmailServiceImpl()
        },
      },

      // useClass
      { provide: NOTIFICATION_SERVICE, useClass: NotificationServiceImpl },
    ],
  })

  console.log('--- Resolving services ---')
  const apiKey = await container.resolve(API_KEY)
  console.log('API Key:', apiKey)

  const emailService = await container.resolve(EMAIL_SERVICE)
  emailService.send('user@example.com', 'Hello!')

  const notificationService = await container.resolve(NOTIFICATION_SERVICE)
  notificationService.notify('user123', 'You have a new message')

  await container.destroy()
}

void main()

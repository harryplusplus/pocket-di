// packages/examples/src/03-token-based-injection.ts

import {
  createContainer,
  defineProvider,
  type InferConstructorParams,
  inject,
  token,
} from 'pocket-di'

// Interface definitions
interface IEmailService {
  send(to: string, message: string): void
}

interface INotificationService {
  notify(userId: string, text: string): void
}

interface ISmsService {
  sendSms(phone: string, message: string): void
}

// Create typed tokens
const EMAIL_SERVICE = token<IEmailService>('EMAIL_SERVICE')
const NOTIFICATION_SERVICE = token<INotificationService>('NOTIFICATION_SERVICE')
const SMS_SERVICE = token<ISmsService>('SMS_SERVICE')
const API_KEY = token<string>('API_KEY')

// Implementation classes
class EmailServiceImpl implements IEmailService {
  send(to: string, message: string) {
    console.log(`[EMAIL] To: ${to}, Message: ${message}`)
  }
}

class NotificationServiceImpl implements INotificationService {
  static [inject] = [EMAIL_SERVICE] as const

  constructor(deps: InferConstructorParams<typeof NotificationServiceImpl>) {
    const [emailService] = deps
    emailService.send('admin@example.com', 'Notification service started')
  }

  notify(userId: string, text: string) {
    console.log(`[NOTIFICATION] User ${userId}: ${text}`)
  }
}

// Factory with dependencies - type inference works!
const smsServiceFactory = defineProvider({
  provide: SMS_SERVICE,
  inject: { email: EMAIL_SERVICE, apiKey: API_KEY },
  useFactory: (deps) => {
    // deps type is inferred as { email: IEmailService; apiKey: string }
    console.log('Creating SmsService via factory with API key:', deps.apiKey)

    return {
      sendSms(phone: string, message: string) {
        console.log(`[SMS] To: ${phone}, Message: ${message}`)
        // Can use injected email service
        deps.email.send('sms-log@example.com', `SMS sent to ${phone}`)
      },
    }
  },
})

async function main() {
  console.log('=== Token-based Injection Example ===\n')

  const container = createContainer({
    providers: [
      // useValue - provide value directly
      { provide: API_KEY, useValue: 'secret-api-key-12345' },

      // useFactory - create using factory function
      {
        provide: EMAIL_SERVICE,
        useFactory: () => {
          console.log('Creating EmailService via factory')
          return new EmailServiceImpl()
        },
      },

      // useClass - create using class
      { provide: NOTIFICATION_SERVICE, useClass: NotificationServiceImpl },

      // useFactory with inject - dependencies are type-inferred
      smsServiceFactory,
    ],
  })

  console.log('--- Resolving services ---')
  const apiKey = await container.resolve(API_KEY)
  console.log('API Key:', apiKey)

  const emailService = await container.resolve(EMAIL_SERVICE)
  emailService.send('user@example.com', 'Hello!')

  const notificationService = await container.resolve(NOTIFICATION_SERVICE)
  notificationService.notify('user123', 'You have a new message')

  const smsService = await container.resolve(SMS_SERVICE)
  smsService.sendSms('+1234567890', 'Hello via SMS!')

  await container.destroy()
}

void main()

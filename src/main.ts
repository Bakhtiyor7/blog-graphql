import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as process from 'node:process'
import { Logger } from '@nestjs/common'

async function bootstrap() {
    const port = process.env.PORT ?? 3001
    const app = await NestFactory.create(AppModule)

    app.enableCors()

    await app.listen(port)
    Logger.log(`App listening on port ${port}`)
}
bootstrap()

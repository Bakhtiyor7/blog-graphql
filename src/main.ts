import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as process from 'node:process'
import { Logger } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
    const port = process.env.PORT ?? 3001
    const app = await NestFactory.create<NestExpressApplication>(AppModule)
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' })

    app.enableCors({
        origin: ['*'], // TODO: specify frontend URL in production
        credentials: true, // allow credentials
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })

    await app.listen(port)
    Logger.log(`App listening on port ${port}`)
}
bootstrap()

import { writeFileSync } from 'fs'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

export async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.use(cookieParser())
    app.enableCors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
    })
    app.useGlobalPipes(new ValidationPipe({ transform: true }))

    return app
}

async function httpBootstrap() {
    const app = await bootstrap()

    await app.listen(process.env.PORT ?? 3000)

    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        console.log('Running in Lambda, skipping Swagger generation.')
        return
    }
    const doc = SwaggerModule.createDocument(app, new DocumentBuilder().build())
    writeFileSync('swagger.json', JSON.stringify(doc, null, 2))
}

if (require.main === module) {
    httpBootstrap()
}

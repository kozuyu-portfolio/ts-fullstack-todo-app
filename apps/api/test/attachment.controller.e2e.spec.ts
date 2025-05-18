/// <reference types="vitest" />

import { S3Client } from '@aws-sdk/client-s3'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { AppModule } from '../src/app.module'
import { CreateAttachmentRequestDto } from '../src/attachment/dto/create-attachment.request.dto'
import { PrismaService } from '../src/prisma/prisma.service'

let app: INestApplication
let server: ReturnType<typeof request>
let prisma: PrismaService
let token = ''
let taskId = 0

beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(S3Client)
        .useValue({})
        .compile()

    vi.mock('@aws-sdk/s3-request-presigner', () => ({
        getSignedUrl: vi.fn(() => 'https://test.com'),
    }))

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()

    server = request(app.getHttpServer())

    // signup
    const res1 = await server.post('/auth/signup').send({ email: 'e2e@example.com', password: 'pass' })
    token = res1.body.access_token

    // task create
    const res2 = await server.post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'upload test' })
    taskId = res2.body.id
})

afterAll(async () => {
    await prisma.$disconnect()
    await app.close()
})

describe('POST /tasks/:id/attachments', () => {
    it('returns presigned url', async () => {
        const dto: CreateAttachmentRequestDto = { filename: 'hello.txt' }
        const res = await server
            .post(`/tasks/${taskId}/attachments`)
            .set('Authorization', `Bearer ${token}`)
            .send(dto)
            .expect(201)

        expect(res.body.url).toBe('https://test.com')
        expect(res.body.key).toMatch(/\.txt$/)
    })
})

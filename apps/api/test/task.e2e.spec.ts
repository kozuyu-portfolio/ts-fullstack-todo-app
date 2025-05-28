/// <reference types="vitest" />

import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { TaskStatus } from '@prisma/client'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

let app: INestApplication
let server: ReturnType<typeof request>
let prisma: PrismaService
let token = ''

beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = app.get(PrismaService)
    await prisma.$transaction([prisma.task.deleteMany(), prisma.user.deleteMany()])

    await app.init()
    server = request(app.getHttpServer())

    // サインアップ→JWT 発行
    const res = await server.post('/auth/signup').send({
        email: 'bob@example.com',
        password: 'password',
    })
    token = res.body.access_token
})

afterAll(async () => {
    await app.close()
})

describe('TaskController E2E', () => {
    let taskId: number

    it('POST /tasks', async () => {
        const res = await server
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Write tests' })
            .expect(201)

        expect(res.body.title).toBe('Write tests')
        taskId = res.body.id
    })

    it('GET /tasks', async () => {
        const res = await server.get('/tasks').set('Authorization', `Bearer ${token}`).expect(200)

        expect(res.body).toHaveLength(1)
    })

    it('PATCH /tasks/:id', async () => {
        const res = await server
            .patch(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: TaskStatus.COMPLETED })
            .expect(200)

        expect(res.body.status).toBe(TaskStatus.COMPLETED)
    })

    it('DELETE /tasks/:id', async () => {
        await server.delete(`/tasks/${taskId}`).set('Authorization', `Bearer ${token}`).expect(200)

        const res = await server.get('/tasks').set('Authorization', `Bearer ${token}`).expect(200)

        expect(res.body).toHaveLength(0)
    })
})

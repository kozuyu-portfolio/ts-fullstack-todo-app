import { S3Client } from '@aws-sdk/client-s3'
import { TaskStatus } from '@prisma/client'
import { mockClient } from 'aws-sdk-client-mock'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { TaskService } from '../src/task/task.service'
import { prisma } from './helper/prisma-test-util'

const s3ClientMock = mockClient(S3Client) as unknown as S3Client

const service = new TaskService(prisma, s3ClientMock)
let userId: string

describe('TaskService (with real DB)', () => {
    beforeAll(async () => {
        const user = await prisma.user.create({
            data: { email: 'bob@test', password: 'hashed' },
        })
        userId = user.id
    })

    beforeEach(async () => {
        await prisma.task.deleteMany({ where: { userId } })
    })

    it('create & findAll', async () => {
        await service.create(userId, { title: 'task1' })
        const list = await service.findAll(userId)
        expect(list).toHaveLength(1)
    })

    it('update & remove', async () => {
        const t = await service.create(userId, { title: 'task2' })
        const updated = await service.update(userId, t.id, { status: TaskStatus.IN_PROGRESS })
        expect(updated.status).toBe(TaskStatus.IN_PROGRESS)

        const res = await service.remove(userId, t.id)
        expect(res.deleted).toBe(true)
    })
})

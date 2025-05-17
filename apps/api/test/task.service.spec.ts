import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { TaskService } from '../src/task/task.service'
import { prisma } from './prisma-test-util'

const service = new TaskService(prisma)
let userId: number

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
        const updated = await service.update(userId, t.id, { isDone: true })
        expect(updated.isDone).toBe(true)

        const res = await service.remove(userId, t.id)
        expect(res.deleted).toBe(true)
    })
})

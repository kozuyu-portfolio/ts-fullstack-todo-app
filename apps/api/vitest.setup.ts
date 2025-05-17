import { afterAll } from 'vitest'
import { dropTestDb, initTestDb, prisma } from './test/prisma-test-util'

initTestDb()

afterAll(async () => {
    await prisma.$disconnect()
    dropTestDb()
})

import { afterAll } from 'vitest'
import { dropTestDb, initTestDb, prisma } from './test/helper/prisma-test-util'

try {
    dropTestDb()
} catch (e) {}
initTestDb()

afterAll(async () => {
    await prisma.$disconnect()
    dropTestDb()
})

import { execSync } from 'child_process'
import { randomUUID } from 'crypto'
import { config } from 'dotenv'
import { PrismaService } from '../../src/prisma/prisma.service'

config({ path: '.env.test' })

const DB_HOST = process.env.DB_HOST || 'db'
const DB_NAME = process.env.VITEST_POOL_ID ? `todo_test_${process.env.VITEST_POOL_ID}` : `todo_test_${randomUUID()}`
process.env.DATABASE_URL = `postgresql://postgres:postgres@${DB_HOST}:5432/${DB_NAME}?schema=public`
process.env.PGPASSWORD = 'postgres'

export const initTestDb = () => {
    execSync(`psql -h ${DB_HOST} -U postgres -d postgres -c "CREATE DATABASE ${DB_NAME};"`)
    execSync('pnpm prisma migrate reset --force --skip-seed', {
        stdio: 'inherit',
    })
}

export const dropTestDb = () => {
    execSync(`psql -h ${DB_HOST} -U postgres -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME} WITH (FORCE);"`)
}

export const prisma = new PrismaService(process.env.DATABASE_URL)

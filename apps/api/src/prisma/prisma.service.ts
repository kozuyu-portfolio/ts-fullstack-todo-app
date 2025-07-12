import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { DATABASE_URL } from '../secrets/secrets.constants.js'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(@Inject(DATABASE_URL) databaseUrl: string) {
        super({
            datasources: {
                db: { url: databaseUrl },
            },
        })
    }

    async onModuleInit() {
        await this.$connect()
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }
}

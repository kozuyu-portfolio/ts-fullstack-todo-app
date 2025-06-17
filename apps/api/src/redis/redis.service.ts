import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis

    constructor() {
        this.client = new Redis(process.env.REDIS_URL || 'redis://redis:6379/0')
    }

    async set(key: string, value: string, ttlSeconds?: number) {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds)
        } else {
            await this.client.set(key, value)
        }
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key)
    }

    async del(key: string) {
        await this.client.del(key)
    }

    async onModuleDestroy() {
        await this.client.quit()
    }
}

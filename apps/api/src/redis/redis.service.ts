import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import { Redis } from 'ioredis'
import { REDIS_URL } from '../secrets/secrets.constants'

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis

    constructor(@Inject(REDIS_URL) redisUrl: string) {
        this.client = new Redis(redisUrl)
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

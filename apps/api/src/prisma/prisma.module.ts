import { Global, Module } from '@nestjs/common'
import { SecretsModule } from '../secrets/secrets.module'
import { PrismaService } from './prisma.service'

@Global()
@Module({
    imports: [SecretsModule],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}

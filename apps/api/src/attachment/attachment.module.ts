import { Module } from '@nestjs/common'
import { AWSModule } from '../aws/aws.module'
import { AttachmentController } from './attachment.controller'
import { AttachmentService } from './attachment.service'

@Module({
    imports: [AWSModule],
    controllers: [AttachmentController],
    providers: [AttachmentService],
})
export class AttachmentModule {}

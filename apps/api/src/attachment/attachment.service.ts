import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { generateUUIDv7 } from '@ts-fullstack-todo/shared'
import { lookup as mime } from 'mime-types'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAttachmentRequestDto } from './dto/create-attachment.request.dto'

@Injectable()
export class AttachmentService {
    private readonly bucket: string

    constructor(
        private readonly prisma: PrismaService,
        private readonly s3: S3Client,
    ) {
        if (!process.env.ATTACHMENT_BUCKET) {
            throw new Error()
        }
        this.bucket = process.env.ATTACHMENT_BUCKET
    }

    async create(userId: string, taskId: string, dto: CreateAttachmentRequestDto) {
        const task = await this.prisma.task.findUnique({ where: { id: taskId } })
        if (!task || task.userId !== userId) {
            throw new ForbiddenException()
        }

        const extension = dto.filename.split('.').pop()
        const objectKey = `${userId}/${taskId}/${generateUUIDv7()}.${extension}`
        const contentType = mime(extension || '') || 'application/octet-stream'

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: objectKey,
            ContentType: contentType,
            Metadata: {
                originalFilename: encodeURIComponent(dto.filename),
            },
        })

        const url = await getSignedUrl(this.s3, command, { expiresIn: 900 })

        await this.prisma.attachment.create({
            data: {
                filename: dto.filename,
                objectKey,
                url: `s3://${this.bucket}/${objectKey}`, // TODO: Cloudfront 経由でのダウンロードURLに変更する
                taskId,
            },
        })

        return { url, key: objectKey }
    }
}

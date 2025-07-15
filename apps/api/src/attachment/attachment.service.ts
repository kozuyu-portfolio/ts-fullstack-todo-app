import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { generateUUIDv7, requireEnv } from '@ts-fullstack-todo/shared'
import { lookup as mime } from 'mime-types'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAttachmentRequestDto } from './dto/create-attachment.request.dto'
import { GetAttachmentResponseDto } from './dto/get-attachment.response.dto'

@Injectable()
export class AttachmentService {
    private readonly bucket: string

    constructor(
        private readonly prisma: PrismaService,
        private readonly s3: S3Client,
    ) {
        this.bucket = requireEnv('ATTACHMENT_BUCKET')
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

        const url = await getSignedUrl(this.s3, command, { expiresIn: 300 })

        await this.prisma.attachment.create({
            data: {
                filename: dto.filename,
                objectKey,
                taskId,
            },
        })

        return { url, key: objectKey }
    }

    async getDownloadUrl(userId: string, attachmentId: string): Promise<GetAttachmentResponseDto> {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: { task: true },
        })
        if (!attachment || attachment.task.userId !== userId) {
            throw new ForbiddenException()
        }

        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: attachment.objectKey,
            ResponseContentDisposition: `attachment; filename="${encodeURIComponent(attachment.filename)}"`,
        })
        const url = await getSignedUrl(this.s3, command, { expiresIn: 300 })

        return { url, filename: attachment.filename }
    }
}

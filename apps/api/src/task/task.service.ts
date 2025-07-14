import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { TaskStatus } from '@prisma/client'
import { requireEnv } from '@ts-fullstack-todo/shared'
import pLimit from 'p-limit'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskRequestDto } from './dto/create-task.request.dto'
import { UpdateTaskRequestDto } from './dto/update-task.request.dto'

@Injectable()
export class TaskService {
    private readonly attachmentBucket: string

    constructor(
        private readonly prisma: PrismaService,
        private readonly s3: S3Client,
    ) {
        this.attachmentBucket = requireEnv('ATTACHMENT_BUCKET')
    }

    create(userId: string, dto: CreateTaskRequestDto) {
        return this.prisma.task.create({
            data: { ...dto, userId },
        })
    }

    findAll(userId: string, status?: TaskStatus) {
        return this.prisma.task.findMany({
            where: { userId, ...(status && { status }) },
            include: { attachments: true },
            orderBy: { createdAt: 'desc' },
        })
    }

    findOne(userId: string, id: string) {
        return this.prisma.task.findFirst({ where: { id, userId }, include: { attachments: true } })
    }

    async update(userId: string, id: string, dto: UpdateTaskRequestDto) {
        const task = await this.prisma.task.findUnique({ where: { id } })
        if (!task || task.userId !== userId) {
            throw new ForbiddenException()
        }
        return this.prisma.task.update({ where: { id }, data: dto, include: { attachments: true } })
    }

    async remove(userId: string, id: string) {
        const attachments = await this.prisma.$transaction(async (tx) => {
            const task = await tx.task.findUnique({ where: { id } })
            if (!task || task.userId !== userId) {
                throw new ForbiddenException()
            }

            const attachments = await tx.attachment.findMany({ where: { taskId: id } })
            await tx.attachment.deleteMany({ where: { taskId: id } })
            await tx.task.delete({ where: { id } })

            return attachments
        })

        try {
            const limit = pLimit(4)
            const deletePromises = attachments.map((attachment) =>
                limit(async () => {
                    await this.s3.send(
                        new DeleteObjectCommand({
                            Bucket: this.attachmentBucket,
                            Key: attachment.objectKey,
                        }),
                    )
                }),
            )
            await Promise.all(deletePromises)
        } catch (error) {
            console.error('Error deleting attachments:', error)
        }

        return { deleted: true }
    }
}

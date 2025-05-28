import { S3Client } from '@aws-sdk/client-s3'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { TaskStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskRequestDto } from './dto/create-task.request.dto'
import { UpdateTaskRequestDto } from './dto/update-task.request.dto'

@Injectable()
export class TaskService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly s3: S3Client,
    ) {}

    create(userId: string, dto: CreateTaskRequestDto) {
        return this.prisma.task.create({
            data: { ...dto, userId },
        })
    }

    findAll(userId: string, status?: TaskStatus) {
        return this.prisma.task.findMany({
            where: { userId, ...(status && { status }) },
            include: { attachments: true },
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
        const task = await this.prisma.task.findUnique({ where: { id } })
        if (!task || task.userId !== userId) {
            throw new ForbiddenException()
        }

        const attachments = await this.prisma.attachment.findMany({ where: { taskId: id } })
        this.prisma.$transaction(async (prisma) => {
            await prisma.attachment.deleteMany({ where: { taskId: id } })
            await prisma.task.delete({ where: { id } })
        })
        // TODO: S3オブジェクトも削除する
        // p-throttle を使って並列実行するか

        return { deleted: true }
    }
}
